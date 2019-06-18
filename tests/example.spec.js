const { parse } = require("..");

it("simple", () => {
  const query = "MATCH (r) RETURN r";
  const result = parse(query);

  expect(result.errors).toEqual([]);
});
