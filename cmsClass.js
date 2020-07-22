class Department{
    constructor(depName){
        this.depName = depName;
    }
}

class Role{
    constructor(title, salary, department){
        this.title = title;
        this.salary = salary;
        this.department = department;
    }
   
}
 
class Employee{
    constructor(last, first, role, isManager){
        this.lastName = last;
        this.firstName = first;
        this.role = role;
        this.isManager = isManager;
    }
}

module.exports = {Department: Department, Role: Role, Employee: Employee};