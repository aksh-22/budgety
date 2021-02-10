//budgetController--------------------------------------------------------

var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                // exp[3-1].id+1;
            } else {
                ID = 0;
            }


            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },
        getbudget: function () {
            return {
                budget: data.budget,
                totalsInc: data.totals.inc,
                totalsExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };
})();

//UIController--------------------------------------------------------


var UIController = (function () {
    var domS = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(domS.inputType).value,
                description: document.querySelector(domS.inputDescription).value,
                value: parseFloat(document.querySelector(domS.inputValue).value)
            };
        },
        getDom: function () {
            return domS;
        },
        addListItem: function (obj, type) {
            var html, newhtml, element;

            if (type === 'inc') {
                element = domS.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = domS.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description" >%description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(domS.inputDescription + ',' + domS.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            //used this method to pass list as array because queryselectorall takes data in list and list has less features we can not acces most features in list so to convert list into array we use "Array.prototype" with "call" and then use slice

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";  //in foreach method alleast it should have one paranmeter
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domS.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domS.incomeLabel).textContent = formatNumber(obj.totalsInc, 'inc');
            document.querySelector(domS.expensesLabel).textContent = formatNumber(obj.totalsExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(domS.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domS.percentageLabel).textContent = '---';
            }

        },

        displayMonth: function () {
            var now, months, month, year;
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domS.dateLabel).textContent = months[month] + ' ' + year;
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(domS.expensesPercLabel);



            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        changedType: function () {
            var fieldds = document.querySelectorAll(
                domS.inputType + ',' +
                domS.inputDescription + ',' +
                domS.inputValue);

            nodeListForEach(fieldds, function (cur) {
                cur.classList.toggel('red-focus');
            });
            document.querySelector(domS.inputBtn).classList.toggel('red');
        },
    };
})();

//globelController-------------------------------------------------


var globelController = (function (budgetCtrl, UICtrl) {

    var events = function () {
        var domS2 = UICtrl.getDom();

        document.querySelector(domS2.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(domS2.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(domS2.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getbudget();
        UICtrl.displayBudget(budget);
        console.log(budget);
    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetController.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemId);
            updateBudget();
            updatePercentages();
        }
    }

    return {
        init: function () {
            console.log('application has started');
            events();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalsInc: 0,
                totalsExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);
globelController.init();
