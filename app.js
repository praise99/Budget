//BUDGET CONTROLLER
var budgetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage=function(totalincome){
        if(totalincome>0){
            this.percentage=Math.round((this.value/totalincome)*100);
        }else{
            this.percentage=-1;
        }
    }
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }
    
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    var calculateTotal=function(type){
        var sum=0;
        data.allitems[type].forEach(function(cur){
            sum +=cur.value;
        });
        data.total[type]=sum;
    }
    var data={
        allitems:{
            inc:[],
            exp:[]
        },
        total:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:-1
    }
    return{
        additem:function(type,des,val){
            var newItem, ID;
            //creating ID
            if(data.allitems[type].length>0){
                ID=data.allitems[type][data.allitems[type].length-1].id+1;
            }else{
                ID=0;
            }
            
            //creating new items
            if(type==="exp"){
                newItem=new Expense(ID,des,val)
            }else if(type==="inc"){
                newItem=new Income(ID,des,val)
            }
            //pushng to data structure
            data.allitems[type].push(newItem);

            //return new item
            return newItem;
        },
        deleteItems:function(type,id){
            var ids,index;
            ids=data.allitems[type].map(function(current){
                return current.id
            })
            index=ids.indexOf(id);

            if (index !==-1){
                data.allitems[type].splice(index,1);
            }
        },
        calculateBudget:function(){
            //calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //calculate the budget
            data.budget=data.total.inc - data.total.exp ;
            
            //calculate the expense percentage
            if(data.total.inc >0){
                data.percentage=Math.round((data.total.exp / data.total.inc)*100);
            }else{
                data.percentage=-1;
            }
            
        },
        calculatePercentage:function(){
            data.allitems.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            })
        },
        getPercentages:function(){
            var allPerc=data.allitems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },
        getBudget: function(){
            return{
                budget:data.budget,
                totalInc:data.total.inc,
                totalExp:data.total.exp,
                percentage:data.percentage
            }
        }
    }

})();

//UI INTERFACE CONTROLLER
var uiController=(function(){
    var domStrings={
        inputType:".add-type",
        inputDescription:".desc",
        inputValue:".value",
        inputbtn:".add-btn",
        incomeContainer:".income-box",
        expenseContainer:".expense-box",
        budgetLabel:".budget",
        incomeLabel:".inc-amt",
        expenseLabel:".exp-amt",
        percentageLabel:".exp-percent",
        containerLabel:".bottom",
        itemPercentage:".item__percentage",
        yearLabel:".year",
        monthLabel:".month"
    }
    var formatNumber=function(num,type){
            var numSplit,int,des;
            num=Math.abs(num);
            num=num.toFixed(2);

            numSplit=num.split(".")
            int=numSplit[0];
            if(int.length>3){
                int=int.substr(0,int.length-3)+ ',' +int.substr(int.length-3,3);
            }

            des=numSplit[1];
            

            return (type==="exp"?"-":"+") + int+ '.'+ des;

        }
    var nodeListForEach=function(list,callback){
        for(var i=0; i<list.length; i++){
                callback(list[i],i)
        }
    }

    return {
        getInput:function(){
            return{
                type:document.querySelector(domStrings.inputType).value,
                description:document.querySelector(domStrings.inputDescription).value,
                value:parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },
        addlistItem:function(obj,type){
            var html,newHtml,element;
            //add html string in aplaceholder
            if (type==="inc"){
                element=domStrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type==="exp"){
                element=domStrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }            
            //replace the placholder with actual data
            newHtml=html.replace("%id%",obj.id);
            newHtml=newHtml.replace("%description%",obj.description);
            newHtml=newHtml.replace("%value%",formatNumber(obj.value,type));
            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);

        },
        deleteListItem:function(selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields, fieldarr;
            fields=document.querySelectorAll(domStrings.inputDescription + ", " +domStrings.inputValue);

            fieldarr=Array.prototype.slice.call(fields);
            fieldarr.forEach(function(cur,index,array){
                cur.value="";
            });
            fieldarr[0].focus();
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0?type="inc":type="exp"
            document.querySelector(domStrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            if(obj.budget>0){
                document.querySelector(domStrings.budgetLabel).style.color="#28B9B5"
            }else{
                document.querySelector(domStrings.budgetLabel).style.color="#FF5049"
            }
            document.querySelector(domStrings.incomeLabel).textContent=formatNumber(obj.totalInc,"inc");
            document.querySelector(domStrings.expenseLabel).textContent=formatNumber(obj.totalExp,"exp");
            if(obj.percentage>0){
                document.querySelector(domStrings.percentageLabel).textContent=obj.percentage + "%";
            }else{
                document.querySelector(domStrings.percentageLabel).textContent="--";
            }
        },
        displayPercentages:function(percentage){
            var fields=document.querySelectorAll(domStrings.itemPercentage);


            
            nodeListForEach(fields,function(current,index) {
                if (percentage[index]>0){
                    current.textContent=percentage[index] + "%";
                }else{
                    current.textContent="--";
                }
            })
        },
        displayMonth:function(){
            var now,year,month,months;
            now=new Date();

            months=["January","February","March","April","May","June","July","August","September","October","November","December"];
            
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(domStrings.yearLabel).textContent=year;
            document.querySelector(domStrings.monthLabel).textContent=months[month];
        },
        changeType:function(){
            var fields=document.querySelectorAll(
                domStrings.inputType + "," +
                domStrings.inputDescription + "," +
                domStrings.inputValue);

                nodeListForEach(fields,function(cur){
                    cur.classList.toggle("red-focus");
                })
            document.querySelector(domStrings.inputbtn).classList.toggle("red");
            
        },
        
        getdomstrings:function(){
            return domStrings;
        }
    }
})();

//APP CONTROLLER
var controller=(function(budgetctrl,uictrl){

    var setupEventlistener=function(){
        var DOM=uictrl.getdomstrings();
        document.querySelector(DOM.inputbtn).addEventListener("click", ctrlAdditem);
        document.addEventListener("keypress",function(event){
        if(event.keyCode===13 || event.which===13){
             ctrlAdditem();
        }
    });
    document.querySelector(DOM.containerLabel).addEventListener("click",ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change",uictrl.changeType)

    }
    var updateBudget=function(){
        //1.calculate the budget
        budgetctrl.calculateBudget();

        //2.return the budget
        var budget=budgetctrl.getBudget();

        //3. Diplay the budget
        uictrl.displayBudget(budget);
        

    }
     var updatePercentages=function(){
         //calculate percentage
         budgetctrl.calculatePercentage();

         //get it from budget controller
         var percent=budgetctrl.getPercentages();

         //update the ui
         uictrl.displayPercentages(percent);
     }
    

    var ctrlAdditem=function(){
        var input,newitem;
        //1. get field input data
        input=uictrl.getInput();
          
        if(input.description !=="" && !isNaN(input.value) && input.value >0){
            //2. Add item to budget controller
        newitem=budgetctrl.additem(input.type,input.description,input.value)

        //3.ADd item to UI
        uictrl.addlistItem(newitem,input.type);

        //4.clear input fields
        uictrl.clearFields();

        //5. update budget
        updateBudget();

        //6. update percentages
        updatePercentages();
        }        
    }
    var ctrlDeleteItem =function(event){
        var itemId,splitId,type,ID;
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){
            splitId=itemId.split('-');
            type=splitId[0]; 
            ID=parseInt(splitId[1]);

            //delete the item from the data structure
            budgetctrl.deleteItems(type,ID);

            //delete from the user interface
            uictrl.deleteListItem(itemId);

            //update the budget
            updateBudget();

            //update percentages
            updatePercentages();

        }
    }
    return{
        init:function(){
            uictrl.displayMonth();
            uictrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1,
            })
            setupEventlistener();
        }
    }
})(budgetController,uiController);


controller.init();