export function buildUpdateQuery(table: string, id: number | string, fields: Record<string, unknown>) {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${index++}`);
      values.push(value);
    }
  }

  values.push(id);

  return {
    sql: `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`,
    params: values,
  };
}
