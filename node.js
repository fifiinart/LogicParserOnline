const errors = require("./errors.js");
const LogicVar = require("./var.js");

module.exports = class LogicNode {

  constructor(operator = null, left = null, right = null, hasNot = false, operatorType = null, nodeObj = null) {
    [this.not, this.and, this.or, this.implies, this.biconditional, this.nand, this.nor] = [...Array(7).keys()];

    this.pseudo = 0;
    this.discrete = 1;
    this.java = 2;

    this.operators = [
      ["not", "and", "or", "implies", "iff", "nand", "nor"],
      ["~", "^", "v", "->", "<->", "|", "⬇"],
      ["!", "&&", "||", "->", "<->", "|", "⬇"]
    ];

    // Check if operator, left, right, and nodeObj are all null
    if (operator == null && left == null && right == null && nodeObj == null) {
      throw new errors.MissingValue("Required variable(s) for LogicNode. Must use either operator, left, and right or nodeObj.");
    }

    // Check if operator, left, and right exist
    else if (operator && left && right) {
      this.operator = operator;
      this.left = left;
      this.right = right;
      this.hasNot = hasNot;
      this.operatorType = operatorType ? operatorType : this.discrete;
    }

    // Check if nodeObj exists
    else if (nodeObj) {

      // Try loading operator
      if (!("operator" in nodeObj)) {
        throw new errors.MissingValue("Required key for LogicNode. Must have \"operator\" in nodeObj.");
      } else {
        this.operator = nodeObj["operator"];
      }

      // Try loading left
      if (!("left" in nodeObj)) {
        throw new errors.MissingValue("Required key for LogicNode. Must have \"left\" in nodeObj.");
      } else {
        this.left = nodeObj["left"];
      }

      // Try loading right
      if (!("right" in nodeObj)) {
        throw new errors.MissingValue("Required key for LogicNode. Must have \"right\" in nodeObj.");
      } else {
        this.right = nodeObj["right"];
      }

      // Try loading hasNot
      if (!("hasNot" in nodeObj)) {
        this.hasNot = hasNot;
      } else {
        this.hasNot = nodeObj["hasNot"];
      }

      // Try loading operatorType
      if (!("operatorType" in nodeObj)) {
        this.operatorType = this.discrete;
      } else {
        this.operatorType = nodeObj["operatorType"];
      }
    }

    // Load left and right values as they should (LogicNode | LogicVar)
    if (this.left instanceof Object) {
      if ("value" in this.left) {
        this.left = new LogicVar(null, null, null, this.left);
      } else {
        this.left = new LogicNode(null, null, null, null, null, this.left);
      }
    }

    if (this.right instanceof Object) {
      if ("value" in this.right) {
        this.right = new LogicVar(null, null, null, this.right);
      } else {
        this.right = new LogicNode(null, null, null, null, null, this.right);
      }
    }
  }

  toString() {
    let left = "" + this.getLeft();
    let right = "" + this.getRight();

    if (this.getLeft() instanceof LogicNode && !this.getLeft().getHasNot()) {
      left = "(" + left + ")";
    }
    if (this.getRight() instanceof LogicNode && !this.getRight().getHasNot()) {
      right = "(" + right + ")";
    }

    let operator = this.getOperator();

    if (this.getHasNot()) {
      return `~(${left} ${operator} ${right})`
    }

    return `${left} ${operator} ${right}`;
  }

  compare(value) {
    if (!(value instanceof LogicNode)) {
      return false;
    }

    return (
      this.getLeft().compare(value.getLeft()) &&
      this.getRight().compare(value.getRight()) &&
      this.getOperatorType == value.getOperatorType() &&
      this.getHasNot() == value.getHasNot()
    );
  }


  getOperatorType() {
    return this.operatorType;
  }

  getOperator() {
    return this.operators[this.getOperatorType()][this.operator];
  }

  getLeft() {
    return this.left;
  }

  getRight() {
    return this.right;
  }

  getHasNot() {
    return this.hasNot;
  }


  getTruthValues(truthValues = []) {

    // Keep track of evaluations
    let evaluations = [];

    // Get left evaluations
    let leftEvaluations = this.getLeft().getTruthValues(truthValues);
    for (const leftEvaluation of leftEvaluations) {
      if (!valueIn(leftEvaluation, evaluations)) {
        evaluations.push(leftEvaluation);
      }
    }

    // Get right evaluations
    let rightEvaluations = this.getRight().getTruthValues(truthValues);
    for (const rightEvaluation of rightEvaluations) {
      if (!valueIn(rightEvaluation, evaluations)) {
        evaluations.push(rightEvaluation);
      }
    }

    // Iterate through all truth values
    for (const truthValue of truthValues) {

      // Evaluate this LogicNode
      let evaluation = {
        "expression": "" + this,
        "truthValue": truthValue,
        "value": this.evaluate(truthValue)
      }

      // Only add evaluation if it doesn't exist already exist
      if (!valueIn(evaluation, evaluations)) {
        evaluations.push(evaluation);
      }
    }

    return evaluations;
  }

  evaluate(truthValue = {}) {

    let left = this.getLeft().evaluate(truthValue);
    let right = this.getRight().evaluate(truthValue);

    if (this.operator == this.and) {
      if (this.getHasNot()) {
        return !(left && right);
      }
      return left && right;
    }

    if (this.operator == this.or) {
      if (this.getHasNot()) {
        return !(left || right);
      }
      return left || right;
    }

    if (this.operator == this.implies) {
      if (this.getHasNot()) {
        return !(!left || right);
      }
      return !left || right;
    }

    if (this.operator == this.biconditional) {
      if (this.getHasNot()) {
        return !(left == right);
      }
      return left == right;
    }

    if (this.operator == this.nand) {
      if (this.getHasNot()) {
        return left && right;
      }
      return !(left && right);
    }

    if (this.operator == this.nor) {
      if (this.getHasNot()) {
        return left || right;
      }

      return !(left || right);
    }
  }
}