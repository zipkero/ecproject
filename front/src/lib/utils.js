export const vSlice = (targets, findIndex, end, data) => {
  const index = targets.findIndex(findIndex);
  if (index < 0) {
    return targets;
  }
  targets.splice(index, end, data);
  return targets;
};
