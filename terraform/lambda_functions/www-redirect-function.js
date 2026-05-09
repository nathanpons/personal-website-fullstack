exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const host = request.headers.host[0].value;

  if (host === "www.nathanpons.com") {
    return {
      status: "301",
      statusDescription: "Moved Permanently",
      headers: {
        location: [
          {
            key: "Location",
            value: "https://" + "nathanpons.com" + request.uri,
          },
        ],
      },
    };
  }

  return request;
};
