// Handlebars-like "when" helper for conditional checks

type Operator = "eq" | "noteq" | "gt" | "gte" | "lt" | "lte" | "or" | "and";

const when = (operand_1: any, operator: Operator, operand_2: any): boolean => {
  switch (operator) {
    case "eq": return operand_1 === operand_2;
    case "noteq": return operand_1 !== operand_2;
    case "gt": return operand_1 > operand_2;
    case "gte": return operand_1 >= operand_2;
    case "lt": return operand_1 < operand_2;
    case "lte": return operand_1 <= operand_2;
    case "or": return operand_1 || operand_2;
    case "and": return operand_1 && operand_2;
    default: return false;
  }
};

export default { when };
