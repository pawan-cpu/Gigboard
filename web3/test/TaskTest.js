//import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
//import { expect } from "chai";
//import { ethers } from "hardhat";
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tasks", function() {
    // let tasksV1: TasksV1;
    let tasksV1;
    let owner;
    let addrs;

    before(async function(){
        const factoryA = await ethers.getContractFactory("TasksV1");
        tasksV1 = await factoryA.deploy();

        [owner, ...addrs] = await ethers.getSigners();
    })

    describe("create a task", function() {
        it("should abe to create task", async function(){
            const salary = "1000000000000000000";
            //const salary = ethers.utils.parseEther("10");  // 10 Ether in Wei
            const jobDesc = "https://example.com";
            const creatorAddr = await addrs[0].getAddress();
            const duration = 30*86400;
    
            await tasksV1.connect(addrs[0]).createTask(duration, jobDesc, "test", { value: salary });
            await tasksV1.connect(addrs[0]).createTask(duration, jobDesc, "test", { value: salary });
    
            const list = await tasksV1.getCreatedTask(creatorAddr);
            expect(list).length(2);
        });
    });

    describe("withdraw", function() {
        it("should abe to withdraw if no one apply", async function() {
            const salary = "10" + "000000000000000000";
            //const salary = ethers.utils.parseEther("10");  // 10 Ether in Wei
            const jobDesc = "https://example.com";
            const startBalance = await addrs[0].getBalance();
            const duration = 30 * 86400;

            //await addrs[0].sendTransaction({ to: tasksV1.address, value: salary });
            //const funds = ethers.utils.parseEther("10");  // 10 Ether in Wei
    
            //taskid should be 3
            await tasksV1.connect(addrs[0])
                .createTask(duration, jobDesc, "test", { 
                    value: salary 
                });
            const taskId = 3;
    
            await tasksV1.connect(addrs[0]).cancelTask(taskId);
            await tasksV1.connect(addrs[0]).withdrawDeposit(taskId);
            const newBalance = await addrs[0].getBalance();
    
            expect(startBalance.sub(newBalance).div("1000000000000000000")).equal(0);
        });
    });

    describe("apply task", function() {
        it("should able to apply task", async function(){
            const taskId = 1;
            const applierAddr1 = await addrs[1].getAddress();
            const applierAddr2 = await addrs[2].getAddress();
    
            expect(tasksV1.connect(addrs[0]).applyTask(taskId)).to.be.reverted;
    
            await tasksV1.connect(addrs[1]).applyTask(taskId);
            await tasksV1.connect(addrs[2]).applyTask(taskId);
    
            expect(await tasksV1.getAppliedTask(applierAddr1)).length(1);
    
            expect(await tasksV1.getApplicant(taskId))
                .include(applierAddr1).and.include(applierAddr2);
        });    
    });

    describe("withdraw application", function() {
        it("should able to withdraw application", async function(){
            const taskId = 1;
            const applierAddr3 = await addrs[3].getAddress();
    
            await tasksV1.connect(addrs[3]).applyTask(taskId);
            expect((await tasksV1.getAppliedTask(applierAddr3)).map(i => i.toNumber())).include(1);
            expect(await tasksV1.getApplicant(taskId)).include(applierAddr3);
    
            await tasksV1.connect(addrs[3]).withdrawApplication(1);
            expect((await tasksV1.getAppliedTask(applierAddr3)).map(i => i.toNumber()))
                .not.include(1);
            expect(await tasksV1.getApplicant(taskId)).not.include(applierAddr3);
        });
    });

    describe("start a task", function() {
        it("should able to start a task", async function(){
            const taskId = 1;
            const providerAddr = await addrs[1].getAddress();
    
            //not creator
            expect(tasksV1.connect(addrs[1]).startTask(taskId, providerAddr))
                .to.be.reverted;
            
            await tasksV1.connect(addrs[0]).startTask(taskId, providerAddr);
            const task = await tasksV1.tasks(taskId);
    
            expect(task.status).equal(2);
            expect(task.provider).equal(providerAddr);
        });
    });

    describe("active tasks", function() {
        it("should return all active tasks", async function() {
            expect(await tasksV1.getActiveTasks(0)).length(1);
            expect(await tasksV1.getActiveTasks(1)).length(1);
            expect(await tasksV1.getActiveTasks(2)).length(1);
        });
    });

    describe("submit prove", function() {
        it("should able to submit prove", async function(){
            const taskId = 1;
    
            expect(tasksV1.connect(addrs[0]).submitResult(taskId, 'https://result.com'))
                .to.be.reverted;
            
            await tasksV1.connect(addrs[1]).submitResult(taskId, 'https://result.com');
            expect((await tasksV1.tasks(taskId)).submission).equal('https://result.com');
        });
    });

    describe("request and dispute", function() {
        it("should able request and resolve dispute", async function(){
            const taskId = 1;
    
            await tasksV1.connect(addrs[1]).requestDispute(taskId);
            expect((await tasksV1.tasks(taskId)).status).equal(4);
    
            const bal0 = await addrs[0].getBalance();
            const bal1 = await addrs[1].getBalance();
    
            await  tasksV1.connect(owner).resolveDispute(taskId, 'https://prove.com', 50, 50);
            const task = await tasksV1.tasks(taskId)
            expect(task.deposit).equal(0);
            expect(task.status).equal(3);
    
            const newBal0 = await addrs[0].getBalance();
            const newBal1 = await addrs[1].getBalance();
            expect(newBal0.sub(bal0).toString()).equal('500000000000000000');
            expect(newBal1.sub(bal1).toString()).equal('500000000000000000');
        });
    });

    describe("fail a task", function() {
        it("should allow creator to fail a task after duration", async function() {
            const taskId = tasksV1.taskCount();
    
            //const salary = "1000000000000000000";
            const salary = ethers.utils.parseEther("10");  // 10 Ether in Wei
            const jobDesc = "https://example.com";
            const beforeBal = await addrs[0].getBalance();
    
            await tasksV1.connect(addrs[0])
                .createTask(0 * 86400, jobDesc, "test", { 
                    value: salary 
                });
    
            await tasksV1.connect(addrs[1]).applyTask(taskId);
            await tasksV1.connect(addrs[0]).startTask(taskId, (await addrs[1].getAddress()));
            await tasksV1.connect(addrs[0]).failTask(taskId, 0, 'Not good.');
            await tasksV1.connect(addrs[0]).withdrawDeposit(taskId);
    
            const afterBalance = await addrs[0].getBalance();
            expect(beforeBal.sub(afterBalance).div("1000000000000000000")).equal(0);
    
            const taskId2 = tasksV1.taskCount();
            await tasksV1.connect(addrs[0])
                .createTask(86400 * 10, jobDesc, "test", { value: salary });
            
            await tasksV1.connect(addrs[1]).applyTask(taskId2);
            await tasksV1.connect(addrs[0]).startTask(taskId2, (await addrs[1].getAddress()));
            expect(tasksV1.connect(addrs[0]).failTask(taskId2, 0, 'Not good.'))
                .to.be.reverted;
        });
    });
});