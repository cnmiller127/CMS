var mysql = require("mysql");
var inquirer = require("inquirer");
var util = require("util");
const cTable = require("console.table");
const Choices = require("inquirer/lib/objects/choices");
const Classes = require("./cmsClass");
const Department = Classes.Department;
const Role = Classes.Role;
const Employee = Classes.Employee;
var asyncQuery;
//const asyncQuery = util.promisify(connection.query).bind(connection);
var departmentArr = [];
var roleArr = [];
var employeesArr = [];
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "superBase93!",
  database: "CMS_DB"
});

connection.connect(function(err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId);
        asyncQuery = util.promisify(connection.query).bind(connection);
        menu();
  });

async function menu(){
    
    var questions = [{type: "list", name: "toDo", message: "Select one of the following:", 
    choices: ["Add department", "Add role", "Add employee", "View departments", "View roles",
     "View employees", "Update employee role", "EXIT PROGRAM"]}];
    try{
    var {toDo} = await inquirer.prompt(questions);
    if(toDo === questions[0].choices[0])
    {
        
        department();
    }
    else if(toDo === questions[0].choices[1])
    {
        
        role();
        
    }
    else if(toDo === questions[0].choices[2])
    {
        
        employee();
        
    }
    else if(toDo === questions[0].choices[3])
    {
        
        viewDepartments()
        
    }
    else if(toDo === questions[0].choices[4])
    {
        
        viewRoles();
        
    }
    else if(toDo === questions[0].choices[5])
    {
        
        viewEmployees();
        
        
    }
    else if(toDo === questions[0].choices[6])
    {
        
        selectEmployeeUpdate();
        
    }
    else if(toDo === questions[0].choices[7])
    {
        
        connection.end();
        
    }
}
    catch(err){
    console.log("error", err)
    }
}

async function department(){
    
    var questions = [{type: "input", name: "department", message: "Enter department name:"}]
    try{
        var {department} = await inquirer.prompt(questions);
        departmentArr.push(department);
        var newDept = new Department(department);
        addDepartment(newDept);
    }
    catch(err){
        console.log("error", err)
    }
}
function addDepartment(newDept){
    connection.query(
        "INSERT INTO department SET ?",
          {
            depName: newDept.depName
          },
        function(err, res) {
          if (err) throw err;
          console.log(res.affectedRows + "Added\n");
          menu();
        }
    )};


function role(){
    //const asyncQuery = util.promisify(connection.query).bind(connection);
    asyncQuery("SELECT depName FROM department").then(function(res){
        departmentArr = [];
            for(var i = 0; i < res.length; i++){
                departmentArr.push(res[i].depName);
            }
        return departmentArr;
    }).then(function (depArr){
    var questions = [{type: "input", name: "title", message: "Enter role title:"},
    {type:"number", name: "salary", message: "Enter salary:"},
    {type:"list", name: "department", message: "Please pick a department", choices: depArr}];
    inquirer.prompt(questions).then(function(ans){
    var {title, salary, department} = ans;
    var newRole = new Role(title, salary, department);
    console.log(newRole);
    addRole(newRole);
    })
    }).catch(err => console.log("err", err))
}

function addRole(newRole){
    
    var depID;
    console.log(newRole.title, newRole.department);
    asyncQuery(
        "SELECT id FROM department WHERE ?",    
          {
            depName: newRole.department
          }).then(function(res){
          depID = res[0].id;
          console.log("role id", depID);
          return depID
        }).then((depID) =>{
    asyncQuery(
        "INSERT INTO role SET ?",    
          {
            title: newRole.title,
            salary: newRole.salary,
            department_id: depID
    
          }).then(() => {
                menu();
          }).catch(err => { console.log("error", err)
        });
    });
}

function employee(){
    //const asyncQuery = util.promisify(connection.query).bind(connection);
    asyncQuery("SELECT title FROM role").then(function(res){
        roleArr = [];
            for(var i = 0; i < res.length; i++){
                roleArr.push(res[i].title);
                console.log(roleArr)
            }
            
        return roleArr;
    }).then(function (roleArr){
    var questions = [{type: "input", name: "last_name", message: "Enter employee last name:"},
    {type: "input", name: "first_name", message: "Enter employee first name:"},
    {type:"list", name: "role", message: "Please select employee role", choices: roleArr},
    {type: "confirm", name: "manage", message: "Is this a managerial role?"}];
    inquirer.prompt(questions).then(function(ans){
    var {last_name, first_name, role, manage} = ans;
    if(manage === true){
        var isMgr = true;
    }
    else{ 
        isMgr = false; 
    }
    console.log(isMgr, "IS MANAGER BABY")
    
    var newEmployee = new Employee(last_name, first_name, role, isMgr);
    addEmployee(newEmployee);
})
}).catch(err => console.log("err", err))
    
}

function addEmployee(newEmployee){
    
    var roleID;
    console.log(newEmployee.firstName);
    asyncQuery(
        "SELECT id FROM role WHERE ?",    
          {
            title: newEmployee.role
          }).then(function(res){
          roleID = res[0].id;
          console.log("role id", roleID);
          return roleID;
        }).then((roleID) =>{
    asyncQuery(
        "INSERT INTO employees SET ?",    
          {
            last_name: newEmployee.lastName,
            first_name: newEmployee.firstName,
            role_id: roleID 
        }).then(() => {
                menu();
          }).catch(err => { console.log("error", err)
        });
    });
}
function selectEmployeeUpdate(){
    asyncQuery("SELECT last_name, first_name FROM employees").then(function(res){
        employeesArr = [];
            for(var i = 0; i < res.length; i++){
                employeesArr.push(res[i].last_name + ", " + res[i].first_name);
            }
            
        return employeesArr;
    }).then(function (employeesArr){
    var questions = [{type:"list", name: "employee", message: "Please select employee to update employee role", choices: employeesArr}];
    inquirer.prompt(questions).then(function(ans){
    var {employee} = ans;
    console.log(employee);
    var fullName = employee.split(",");
    var last = fullName[0].trim();
    var first = fullName[1].trim();
    updateEmployee(last, first);
    
})
}).catch(err => console.log("err", err))
  
}
function updateEmployee(last, first){
    asyncQuery("SELECT title FROM role").then(function(res){
        roleArr = [];
        for(var i = 0; i < res.length; i++){
            
            roleArr.push(res[i].title);
            
        }  
        return roleArr;
    }).then(function (rArr){
    var questions = [{type:"list", name: "updatedRole", message: "Please select role to update " + last + ", " + first + " role", choices: rArr}];
    inquirer.prompt(questions).then(function(ans){
        console.log(ans, "ANS")
    var {updatedRole} = ans;
    
    //new
    var roleID;
    asyncQuery(
        "SELECT id FROM role WHERE ?",    
          {
            title: updatedRole
          }).then(function(res){
              console.log(updatedRole, "UPDATED ROLL")
          roleID = res[0].id;
          console.log("role id", roleID);
          return roleID;
        }).then((roleID) =>{
            //
            asyncQuery(
                "UPDATE employees SET ? WHERE ? AND ?",    
                  [
                    {role_id: roleID},
                    {last_name: last},
                    {first_name: first}
            
                  ]).then(() => {
                        menu();
                  }).catch(err => { console.log("error", err)
                });

        })
    });
});
}

function viewDepartments(){
    connection.query("SELECT * FROM department", function(err, res){
        if(err) throw err;
        console.log("\n");
        console.table(res);
        inquirer.prompt({type: "input", name: "conf", message: "Press any button to return to main menu"}).then(() => {
        menu();
        }).catch(err => console.log(err))
    })
}

function viewRoles(){
    connection.query("SELECT * FROM role", function(err, res){
        if(err) throw err;
        console.log("\n");
        console.table(res);
        inquirer.prompt({type: "input", name: "conf", message: "Press any button to return to main menu"}).then(() => {
        menu();
        }).catch(err => console.log(err))
    })
}
    

function viewEmployees(){
    connection.query("SELECT * FROM employees LEFT JOIN role ON employees.role_id = role.id", function(err, res){
        if(err) throw err;
        console.log("\n");
        console.table(res);
        inquirer.prompt({type: "input", name: "conf", message: "Press any button to return to main menu"}).then(() => {
        menu();
        }).catch(err => console.log(err))
    })
}

