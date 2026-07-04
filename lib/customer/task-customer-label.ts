/** Person name for task customer pickers and hydrated task display (leads + contacts). */
export function taskCustomerContactLabel(customer: {
  name?: string;
  email?: string;
}): string {
  return customer.name?.trim() || customer.email?.trim() || "Unnamed contact";
}
