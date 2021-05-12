export default function (valueA, valueB) {
  const field = this.field;

  if (field === "STATUS") {
    // ing 이면 이기고 아니면 상관없음

    let value1 = valueA?.value;
    return value1 === 30 ? 1 : -1;
  } else {
    let label1 = valueA?.label ?? "";
    let label2 = valueB?.label ?? "";

    if (label1 === label2) {
      return 0;
    } else if (label1 > label2) {
      return 1;
    } else {
      return -1;
    }
  }
}
