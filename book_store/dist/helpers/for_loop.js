// Handlebars-like "when" helper for conditional checks
const when = (operand_1, operator, operand_2) => {
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
//# sourceMappingURL=for_loop.js.map