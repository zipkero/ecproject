export const vSlice = (targets, findIndex, end, data) => {
  const index = targets.findIndex(findIndex);
  if (index < 0) {
    return targets;
  }
  targets.splice(index, end, data);
  return targets;
};

export const vMove = (targets, targetIndex, sourceIndex) => {
  const index = targets.findIndex(targetIndex);
  if (index > -1) {
    const temp = targets[index];
    targets.splice(index, 1);
    const newIndex = targets.findIndex(sourceIndex);
    if (newIndex > -1) {
      targets.splice(newIndex, 1, temp);
    }
  }
  return targets;
};
