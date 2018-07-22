const $ = (id) => document.getElementById(id);

const InputStream = stream => {
    let out = stream.replace(/.$/, '');
    return out.split(' ').map(str => str.trim());
}

const decExpr = /(01|77|88|[0-4][2-9])\s([a-zA-Z]\w*)\s(PIC A\(s\d\d?\)|PIC X\(\d\d?\)|PIC 1 USAGE BIT|USAGE INDEX|PIC N\(\d\d?\)|PIC 9\(\d\d?\)|USAGE OBJECT REFERENCE|USAGE POINTER)\s((VALUE)\s(\'*\w*\.?\w*\'*))?\.$/im;
expru = /(01|77|88|[0-4][2-9])\s([a-zA-Z]\w*)\s(PIC 1 USAGE BIT|USAGE INDEX|USAGE OBJECT REFERENCE|USAGE POINTER)\s\.$/im;//usage
exprsv = /(01|77|88|[0-4][2-9])\s([a-zA-Z]\w*)\s(PIC A\(\d\d?\)|PIC X\(\d\d?\)|PIC 1 USAGE BIT|USAGE INDEX|PIC N\(\d\d?\)|PIC 9\(\d\d?\)|USAGE OBJECT REFERENCE|USAGE POINTER)\.$/im;//sin value
const type = { alphabet: "A", alphanumeric: "X", numeric: "9", boolean: "1" };
let varsData = [],
    data = {};
function compile() {
    const sourceCode = document.getElementById('source-code');
    var lines = sourceCode.value.split('\n');
    for (var i = 0; i < lines.length; i++) {
        let inputVars = InputStream(lines[i]);
        var str = lines[i];
        if (decExpr.test(str) || expru.test(str) || exprsv.test(str)) {
            Materialize.toast("Declaración correcta", 2000, 'rounded teal darken-3');
        } else {
            Materialize.toast("Error en declaración", 2000, 'rounded red darken-4');
            return;
        }
        let typeId = inputVars[3].charAt(0);
        let declaredBytes = inputVars[3].substring(2, inputVars[3].length - 1);
        function countNumeric() {
            let num = (inputVars[5].length <= declaredBytes) ? parseFloat(inputVars[5]) : null;
            return num;
        }

        function countAlpha() {
            let chars = (inputVars[5].length <= declaredBytes) ? inputVars[5].replace(/\'/g, "") : null;
            return chars;
        }

        switch (typeId) {
            case type.alphabet:
                if (inputVars[5] != null) {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Alfabético", bytes: declaredBytes, value: countAlpha() });
                } else {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Alfabético", bytes: declaredBytes, value: null });
                }
                break;

            case type.alphanumeric:
                if (inputVars[5] != null) {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Alfanumérico", bytes: declaredBytes, value: countAlpha() });
                } else {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Alfanumérico", bytes: declaredBytes, value: null });

                }
                break;

            case type.numeric:
                if (inputVars[5] != null) {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Numérico", bytes: declaredBytes, value: countNumeric() });
                } else {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Numérico", bytes: declaredBytes, value: null });
                }
                break;

            case type.boolean:
                if (inputVars[5] != null) {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Booleano", bytes: declaredBytes, value: true });
                } else {
                    varsData.push(data = { level: inputVars[0], id: inputVars[1], type: "Booleano", bytes: declaredBytes, value: null });

                }
                break;

            default:
                varsData.push({ error: `Error de declaración. ${typeId} no es un tipo de dato COBOL.` });
                break;
        }
        console.log(varsData);
    }
};

//FUNCIÓN OPERAR VARIABLES
const opExpr = /(COMPUTE)\s([a-zA-Z]\w*)\s(=)\s(([0-9]+[0-9]*)|([a-zA-Z]\w*))(\s(\+|\-|\*|\/|\*\*)\s(([0-9]+[0-9]*)|([a-zA-Z]\w*)))+\.$/im;
declaredVars = [];
var varExpr = /([a-zA-Z]\w*)/;

function operate() {
    for (let i in varsData) {
        if (varsData[i].type == "Numérico") {
            var declaracion = "var " + varsData[i].id + " ; " + varsData[i].id + " = " + varsData[i].value + ";";
            eval(declaracion);
        } else {
            var declaracion = "var " + varsData[i].id + " ; " + varsData[i].id + " = '" + varsData[i].value + "';";
            eval(declaracion);
        }
        if (varsData[i].value === null) {
            console.warn(`la variable  ${varsData[i].id}. ha sido declarada sin embargo no se le ha asignado un valor`);
        }
    }
    var res;
    var f = true;
    const sourceCode2 = document.getElementById('source-code2');
    try {
        eval(sourceCode2.value.slice(7, sourceCode2.value.length - 1) + ";")
    } catch (error) {
        f = false;
    }
    if (opExpr.test(sourceCode2.value) || (f && (/compute/i.test(sourceCode2.value)) && /\(/.test(sourceCode2.value)) && /.$/.test(sourceCode2.value)) { 
        Materialize.toast("la sintaxis de la operacion es correcta", 2000, 'rounded teal darken-3');
    } else {
        Materialize.toast("no ingresaste una operacion valida", 2000, 'rounded red darken-4');
        return;
    }
    if (!/\(/.test(sourceCode2.value)) {
        let inputVars = InputStream(sourceCode2.value);

        for (let i = 1; i <= inputVars.length - 1; i++) {
            if (varExpr.test(inputVars[i])) {
                for (j in varsData) {
                    if (inputVars[i] == varsData[j].id) {
                        declaredVars.push(inputVars[i]);
                        console.log("la variable " + inputVars[i] + " utilizada en la operacion ya esta previamente definida y es valida");
                    }
                }
                if (declaredVars.indexOf(inputVars[i]) < 0) {
                    console.warn("la variable " + inputVars[i] + " utilizada en la operacion no ha sido previamente definida, la operacion no pudo ser procesada");
                    Materialize.toast("Ocurrio un error al procesar la operacion", 2000, 'rounded red darken-4');
                    document.getElementById("resultado").style.color = "red";
                    document.getElementById("resultado").innerHTML = "ERROR";
                    return;
                }
            }
        }
        var ro = varExpr.exec(sourceCode2.value.slice(7, sourceCode2.value.length - 1))[0];
        res = eval(sourceCode2.value.slice(7, sourceCode2.value.length - 1) + ";");

        console.log("resultado de la operacion ingresada es " + ro + " = " + res);
        document.getElementById("resultado").style.color = "teal";
        document.getElementById("resultado").innerHTML = "" + ro + " = " + res;
    } else {
        var ro = varExpr.exec(sourceCode2.value.slice(7, sourceCode2.value.length - 1))[0];
        res = eval(sourceCode2.value.slice(7, sourceCode2.value.length - 1) + ";");
        console.log("resultado de la operacion ingresada es " + ro + " = " + res);
        document.getElementById("resultado").style.color = "teal";
        document.getElementById("resultado").innerHTML = "" + ro + " = " + res;
    }

    for (let i in varsData) {
        if (varsData[i].type == "Numérico") {
            var declaracion = "var " + varsData[i].id + " ; " + varsData[i].id + " = " + varsData[i].value + ";";
            eval(declaracion);
        } else {
            var declaracion = "var " + varsData[i].id + " ; " + varsData[i].id + " = '" + varsData[i].value + "';";
            eval(declaracion);
        }
        if (varsData[i].value === null) {
            console.warn(`la variable  ${varsData[i].id}. ha sido declarada sin embargo no se le ha asignado un valor`);
        }
    }

    // CONVERSIÓN A POSTFIJO
    const p = new Postfix();
    let infixOp = $('source-code2').value.split('=').pop().trim();
    let equal = $('source-code2').value.charAt(8);
    console.log(equal);
    let postfixOp = p.infixToPostfix(infixOp.split('.')[0].trim());
    console.log(postfixOp);
    let postfixArray = postfixOp.split(' ');
    let arr = [];
    for (let i = 0; i < postfixArray.length-1; i++) {
        arr[i] = postfixArray[i];
    }
    console.log(arr);
    getIntermediateCode(arr, $('assembly-text'), equal);
    $('answer').innerHTML = postfixOp;

} // end of OPERATE

Object.assign(Array.prototype, {
    clean() {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === "") {
                this.splice(i, 1);
            }
        }
        return this;
    }
})

Object.assign(String.prototype, {
    isNumeric() {
        return !isNaN(parseFloat(this)) && isFinite(this);
    }
})

const isDeclared = (val) => {
    for (let i = 0; i < varsData.length; i++) {
        if (varsData[i].id === val) {
            return true;
        }
    }
    return false;
}

function Postfix() {
    this.infixToPostfix = function (infix) {
        let outputQueue = "";
        let operatorStack = [];
        let operators = {
            "^": {
                precedence: 4,
                associativity: "Right"
            },
            "/": {
                precedence: 3,
                associativity: "Left",
                code: "DIV"
            },
            "*": {
                precedence: 3,
                associativity: "Left",
                code: "MUL"
            },
            "+": {
                precedence: 2,
                associativity: "Left",
                code: "ADD"
            },
            "-": {
                precedence: 2,
                associativity: "Left",
                code: "SUB"
            }
        }
        infix = infix.replace(/\s+/g, "");
        infix = infix.split(/([\+\-\*\/\^\(\)])/).clean();
        for (let i = 0; i < infix.length; i++) {
            let token = infix[i];
            if (isDeclared(token) || token.isNumeric()) {
                outputQueue += token + " ";
            } else if ("^*/+-".indexOf(token) !== -1) {
                let o1 = token;
                let o2 = operatorStack[operatorStack.length - 1];
                while ("^*/+-".indexOf(o2) !== -1 && ((operators[o1].associativity === "Left" && operators[o1].precedence <= operators[o2].precedence) || (operators[o1].associativity === "Right" && operators[o1].precedence < operators[o2].precedence))) {
                    outputQueue += operatorStack.pop() + " ";
                    o2 = operatorStack[operatorStack.length - 1];
                }
                operatorStack.push(o1);
            } else if (token === "(") {
                operatorStack.push(token);
            } else if (token === ")") {
                while (operatorStack[operatorStack.length - 1] !== "(") {
                    outputQueue += operatorStack.pop() + " ";
                }
                operatorStack.pop();
            }
        }
        while (operatorStack.length > 0) {
            outputQueue += operatorStack.pop() + " ";
        }
        return outputQueue;
    }
}

const getSymbol = (str) => {
    let symbols = {
        '+': 'ADD',
        '-': 'SUB',
        '/': 'DIV',
        '*': 'MUL',
    }
    for (let i in symbols) {
        if (str === i) {
            return symbols[i];
        }
    }
    return undefined;
}

const getIntermediateCode = (postfix, elem, equal = false) => {
    let values = [], rs = 1;
    for (let i in varsData) {
        var declaracion = "var " + varsData[i].id + " ; " + varsData[i].id + " = " + varsData[i].value + ";";
        eval(declaracion);
    }
    for (let i = 0; i < postfix.length; i++) {
        if (postfix[i] === '+' || postfix[i] === '-' || postfix[i] === '*' || postfix[i] === '/') {
            let op = getSymbol(postfix[i]);
            let val2 = values.pop();
            let val1 = values.pop();
            //console.log(`${val1}-${postfix[i]}-${val2}`);
            let result = `R${rs}=${eval(`${val1}${postfix[i]} ${val2}`)}`;
            //let result = `R${rs}=${eval(val1 + postfix[i] + val2)}`;
            let codeLine = (`${op}    ${val1}    ${val2}        ${result}`);
            elem.innerHTML += `${codeLine}<br>`
            values.push(eval(result));
            rs++;
        } else {
            values.push(postfix[i]);
            varsData[i]
            postfix.splice(i, 1);
            i--;
        }
    }
    if (equal) {
        rs--;
        elem.innerHTML += `STO    R${rs}    ${equal}`;
    }
}

/**
 * 
 * 
01 X PIC 9(9) VALUE 40.
01 Y PIC 9(9) VALUE 3.
01 Z PIC 9(9).
01 A PIC 9(9) VALUE 4.
 */