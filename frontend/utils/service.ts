import _axios from "axios";

const axios = (baseURL: string) => {
  const instance = _axios.create({
    baseURL: baseURL || process.env.REACT_APP_SERVER_HOST,
    timeout: 10000,
  });

  return instance;
};

export { axios };
export default axios;