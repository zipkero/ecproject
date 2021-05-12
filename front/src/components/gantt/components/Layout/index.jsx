import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import Sidebar from "../Sidebar";
import Timeline from "../Timeline";
import { addListener, removeListener } from "../../utils/events";
import raf from "../../utils/raf";
import getNumericPropertyValue from "../../utils/getNumericPropertyValue";
import { BottomScroll } from "../../builders";
const bottomScroll = new BottomScroll();
class Layout extends PureComponent {
  constructor(props) {
    super(props);

    this.timeline = React.createRef();
    this.layout = React.createRef();
    this.sidebar = React.createRef();

    this.state = {
      isSticky: false,
      headerHeight: 0,
      timelineTopPosition: 0,
      scrollLeft: 0,
    };
  }

  componentDidMount() {
    const { enableSticky } = this.props;

    const { top } = this.timeline.current.getBoundingClientRect();
    this.setState({ timelineTopPosition: top });

    if (enableSticky) {
      this.updateTimelineHeaderScroll();
      this.updateTimelineBodyScroll();
    }

    addListener("resize", this.handleResize);
    this.handleLayoutChange(() => this.scrollToNow());
  }

  componentDidUpdate(prevProps, prevState) {
    const { enableSticky, isOpen } = this.props;
    const { isSticky, scrollLeft } = this.state;

    if (enableSticky && isSticky) {
      if (!prevState.isSticky) {
        this.updateTimelineHeaderScroll();
      }

      if (scrollLeft !== prevState.scrollLeft) {
        this.updateTimelineBodyScroll();
      }
    }

    if (isOpen !== prevProps.isOpen) {
      this.handleLayoutChange();
    }
  }

  componentWillUnmount() {
    const { enableSticky } = this.props;

    if (enableSticky) {
      removeListener("resize", this.handleResize);
    }
  }

  setHeaderHeight = (headerHeight) => {
    this.setState({ headerHeight });
  };

  scrollToNow = () => {
    const { time, scrollToNow, now, timelineViewportWidth } = this.props;
    if (scrollToNow) {
      this.timeline.current.scrollLeft =
        time.toX(now) - 0.5 * timelineViewportWidth;
    }
  };

  updateTimelineBodyScroll = () => {
    const { scrollLeft } = this.state;
    this.timeline.current.scrollLeft = scrollLeft;
  };

  updateTimelineHeaderScroll = () => {
    const { scrollLeft } = this.timeline.current;
    this.setState({ scrollLeft });
  };

  handleHeaderScrollY = (scrollLeft) => {
    raf(() => {
      this.setState({ scrollLeft });
    });
  };

  handleScrollY = () => {
    raf(() => {
      const { headerHeight, timelineTopPosition } = this.state;
      const { top, bottom } = this.timeline.current.getBoundingClientRect();
      const isSticky = top <= timelineTopPosition && bottom >= headerHeight;
      this.setState(() => ({ isSticky }));
    });
  };

  handleScrollX = () => {
    raf(this.updateTimelineHeaderScroll);
  };

  calculateSidebarWidth = () =>
    this.sidebar.current.offsetWidth +
    getNumericPropertyValue(this.layout.current, "margin-left");

  calculateTimelineViewportWidth = () => this.timeline.current.offsetWidth;

  handleLayoutChange = (cb) => {
    const { sidebarWidth, timelineViewportWidth, onLayoutChange } = this.props;

    const nextSidebarWidth = this.calculateSidebarWidth();
    const nextTimelineViewportWidth = this.calculateTimelineViewportWidth();
    if (
      nextSidebarWidth !== sidebarWidth ||
      nextTimelineViewportWidth !== timelineViewportWidth
    ) {
      onLayoutChange(
        {
          sidebarWidth: this.calculateSidebarWidth(),
          timelineViewportWidth: this.calculateTimelineViewportWidth(),
        },
        cb
      );
    }
  };

  handleResize = () => this.handleLayoutChange();

  handleMouseDown = (event) => {
    event.preventDefault();

    const { clientWidth, scrollWidth } = this.timeline.current;
    const maxScrollLeft = scrollWidth - clientWidth;
    bottomScroll.scrollInfo = {
      pageX: event.pageX,
      maxScrollLeft,
      moveScroll: true,
    };
  };

  handleMouseUp = () => {
    bottomScroll.scrollInfo = { moveScroll: false };
  };

  handleMouseMove = (event) => {
    if (bottomScroll.moveScroll) {
      bottomScroll.currentPageX = event.pageX;
      bottomScroll.currentScrollLeft = this.state.scrollLeft;
      const nextScrollLeft = bottomScroll.nextScrollLeft;
      this.setState({ scrollLeft: nextScrollLeft });
      // this.timeline.current.scroll({left: nextScrollLeft});
    }
  };

  render() {
    const {
      isOpen,
      tracks,
      now,
      time,
      timebar,
      sidebarWidth,
      timelineViewportWidth,
      handlePopup,
    } = this.props;

    const {
      isSticky,
      headerHeight,
      timelineTopPosition,
      scrollLeft,
    } = this.state;
    return (
      <div
        className={`rt-custom-layout ${isOpen ? "rt-is-open" : ""}`}
        ref={this.layout}
        onScroll={this.handleScrollY}
      >
        <div className="rt-layout__side" ref={this.sidebar}>
          <Sidebar
            timebar={timebar}
            tracks={tracks}
            sticky={{
              isSticky,
              headerHeight,
              timelineTopPosition,
              sidebarWidth,
            }}
          />
        </div>
        <div className="rt-layout__main">
          <div
            className="rt-layout__timeline"
            ref={this.timeline}
            onScroll={this.handleScrollX}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
          >
            <Timeline
              now={now}
              time={time}
              timebar={timebar}
              tracks={tracks}
              sticky={{
                isSticky,
                setHeaderHeight: this.setHeaderHeight,
                viewportWidth: timelineViewportWidth,
                handleHeaderScrollY: this.handleHeaderScrollY,
                headerHeight,
                timelineTopPosition,
                scrollLeft,
              }}
              handlePopup={handlePopup}
            />
          </div>
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  enableSticky: PropTypes.bool.isRequired,
  timebar: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  time: PropTypes.shape({
    toX: PropTypes.func.isRequired,
  }).isRequired,
  tracks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  now: PropTypes.instanceOf(Date),
  isOpen: PropTypes.bool,
  scrollToNow: PropTypes.bool,
  onLayoutChange: PropTypes.func.isRequired,
  sidebarWidth: PropTypes.number,
  timelineViewportWidth: PropTypes.number,
};

export default Layout;
