/**
 * @description 对象转query字符串
 * @param {Record<string,any>} queryObj
 * @return {string}
 */
export const query = queryObj =>
  Object.keys(queryObj ?? {})
    .map(key =>
      key.concat(
        '=',
        // 对于基本类型直接转换为字符串，不需要JSON.stringify
        String(queryObj[key])
      )
    )
    .join('&');
