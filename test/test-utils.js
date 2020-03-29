module.exports.toArray = async function (stream) {
  const result = [];
  for await (const elem of stream) {
    result.push(elem);
  }
  return result;
}