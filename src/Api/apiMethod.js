import APIKit from "./apiKit";


const StatusCodes = {
  Success: 1,
  Failure: 0,
  ServerDown: 2,
  Unauthenticate: 3,
};

export const Method = {
  async POST(url, body) {
    return await new Promise((resolve, reject) => {
      APIKit.post(url, body, {
        headers: {
          "access-control-allow-origin": "*",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((result) => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 5,
                error: "Something went wrong.",
              });
            }
          }
        })
        .catch((err) => {
          console.log("catch  = ", err.response)
          if (err.response) {
            if (
              err.response.status !== null &&
              err.response.status !== undefined
            ) {
              if (err.response.status == 500) {
                return reject({
                  status: 2,
                  error: err,
                });
              } else if (err.response.status == 403) {
                return resolve({
                  status: 4,
                  error: err?.response?.data?.message,
                });
              } else if (
                err.response.status == 401 ||
                err.response.status == 404
              ) {
                return reject({
                  status: 4,
                  error: err?.response?.data?.message,
                });
              } else if (err.response.status == 400) {
                return reject({
                  status: StatusCodes.Failure,
                  error: err?.response?.data?.message,
                });
              } else {
                return reject({
                  status: 8,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 6,
              error: "Something went wrong.",
            });
          }
        });
    });
  },
  PUT(url, body) {
    return APIKit.put(url, body, {
      headers: {
        "access-control-allow-origin": "*",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(async (data) => {
        if (data) {
          if (data.status === 200) {
            return {
              status: StatusCodes.Success,
              result: data.data,
            };
          } else {
            return {
              result: { msg: data.data.message },
              status: StatusCodes.Failure,
            };
          }
        } else {
          return {
            result: { msg: "Something went wrong." },
            status: StatusCodes.Failure,
          };
        }
      })
      .catch(async (error) => {
        if (!error.response) {
          localStorage.removeItem("token");
          return {
            result: { msg: "Timeout : server issue" },
            status: StatusCodes.Failure,
          };
        } else if (
          error.response.data &&
          error.response.data.error &&
          error.response.data.error.message
        ) {
          return {
            result: { msg: error.response.data.error.message }, // error.response.data.message
            status: StatusCodes.Failure,
          };
        } else {
          return {
            result: { msg: error.response.data.message }, // error.response.data.message
            status: StatusCodes.Failure,
          };
        }
      });
  },
  DELETE(url, body) {
    return APIKit.delete(url, body, {
      headers: {
        "access-control-allow-origin": "*",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(async (data) => {
        if (data) {
          if (data.status === 200) {
            return {
              status: StatusCodes.Success,
              result: data.data,
            };
          } else {
            return {
              result: { msg: data.data.message },
              status: StatusCodes.Failure,
            };
          }
        } else {
          return {
            result: { msg: "Something went wrong." },
            status: StatusCodes.Failure,
          };
        }
      })
      .catch(async (error) => {
        if (!error.response) {
          localStorage.removeItem("token");
          return {
            result: { msg: "Timeout : server issue" },
            status: StatusCodes.Failure,
          };
        } else if (
          error.response.data &&
          error.response.data.error &&
          error.response.data.error.message
        ) {
          return {
            result: { msg: error.response.data.error.message }, // error.response.data.message
            status: StatusCodes.Failure,
          };
        } else {
          return {
            result: { msg: error.response.data.message }, // error.response.data.message
            status: StatusCodes.Failure,
          };
        }
      });
  },
  async GET(url, body) {
    return await new Promise((resolve, reject) => {
      APIKit.get(url, {
        headers: {
          "access-control-allow-origin": "*",
          "content-type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
      })
        .then(async (data) => {
          if (data) {
            console.log("first = = = ")
            if (data.status === 200) {
              return resolve({
                status: StatusCodes.Success,
                result: data.data,
              });
            } else {
              console.log("second = = = ")
              return reject({
                result: { msg: data.data.message },
                status: StatusCodes.Failure,
              });
            }
          } else {
            console.log("third = = = ")
            return reject({
              result: { msg: "Something went wrong." },
              status: StatusCodes.Failure,
            });
          }
        })
        .catch(async (error) => {
          if (!error.response) {
            console.log("fourth = = = ")
            localStorage.removeItem("token");
            return reject({
              result: { msg: "Timeout : server issue" },
              status: StatusCodes.Failure,
            });
          } else {
            console.log("fifth = = = ", error.response.status)
            if (error.response.status == '401') {
              return reject({
                status: 4,
                error: error.response.data.message
              })
            } else if (error.response.status === 0) {
              return reject({
                status: StatusCodes.Failure,
                error: 'Something went wrong'
              })
            }
            return resolve({
              result: { msg: error.response.data.message },
              status: StatusCodes.Failure,
            });
          }
        });

    })
  },
};








