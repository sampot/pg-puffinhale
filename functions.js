export default { async fetch(request) { return Response.json({ ok: true, name: "pg-puffinhale", path: new URL(request.url).pathname }); } };
/** Optional Playgrounds stub. */
export default {
  async fetch(request) {
    return Response.json({ ok: true, name: "pg-puffinhale", path: new URL(request.url).pathname });
  },
};
