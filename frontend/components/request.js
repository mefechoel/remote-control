// eslint-disable-next-line import/no-unresolved
import baseUrl from "consts:baseUrl";

const joinParams = (params) =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

const createQueryString = (params) =>
  params && Object.keys(params).length
    ? `?${joinParams(params)}`
    : "";

const request = (endpoint, params) =>
  fetch(`${baseUrl}/api/${endpoint}${createQueryString(params)}`);

export default request;
