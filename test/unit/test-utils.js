export async function toArray(stream) {
  const result = [];
  for await (const elem of stream) {
    result.push(elem);
  }
  return result;
}