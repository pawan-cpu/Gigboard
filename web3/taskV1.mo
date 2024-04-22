import Prim "mo:prim";
import Time "mo:time";
import Shared "mo:shared";
import Encode "mo:base/Encode";
import Call "mo:base/Call";

actor TasksV1 {

  type TaskActions = { cancel; withdraw; applyTask; withdrawApp; start; fail; submit; complete; dispute; resolve };
  type TaskStatus = { active; cancelled; started; completed; dispute; failed };

  public type Task = {
    createdTime: Time;
    startTime: Time;
    duration: Time;
    salary: Nat;
    deposit: Nat;
    creator: Principal;
    provider: Principal;
    status: TaskStatus;
    jobDesc: Text;
    submission: Text;
    disputeResult: Text;
  };

  public type TaskRating = {
    creatorRating: Nat8;
    providerRating: Nat8;
    commentForCreator: Text;
    commentForProvider: Text;
  };

  public var taskCount : Nat = 1;
  public var unlockTime : Time = 2592000;
  public var createdTasks : [Principal] -> [Nat] = Prim.map_empty();
  public var provideredTasks : [Principal] -> [Nat] = Prim.map_empty();
  public var appliedTasks : [Principal] -> [Nat] = Prim.map_empty();
  public var applicants : [Nat] -> [Principal] = Prim.map_empty();
  public var tasks : [Nat] -> Task = Prim.map_empty();
  public var tasksRating : [Nat] -> TaskRating = Prim.map_empty();

  public func updateUnlockTime(_unlockTime: Time) : async {
    unlockTime := _unlockTime;
  };

  public func createTask(duration: Time, jobDesc: Text, refId: Text) : async {
    let creator : Principal = Principal.fromActor(Principal.fromActorId(Call.caller));
    let task : Task = {
      createdTime = Time.now(),
      startTime = 0,
      duration = duration,
      salary = Call.caller_balance : Nat,
      deposit = Call.caller_balance : Nat,
      creator = creator,
      provider = Principal.fromActor(null),
      status = TaskStatus.active,
      jobDesc = jobDesc,
      submission = "",
      disputeResult = ""
    };

    let taskId : Nat = taskCount;
    taskCount := taskCount + 1;

    createdTasks[creator] := Prim.update_opt(createdTasks[creator], Prim.vec_append([taskId]));

    tasks[taskId] := task;

    emit TaskCreation(taskId, task, creator, refId);
  };

  public func cancelTask(taskId: Nat) : async {
    if (tasks[taskId].creator != Principal.fromActor(Principal.fromActorId(Call.caller))
        || tasks[taskId].status != TaskStatus.active) {
      assert(false, "Not creator or task not active");
    }

    tasks[taskId].status := TaskStatus.cancelled;

    emit TaskUpdate(taskId, Principal.fromActor(Principal.fromActorId(Call.caller)), TaskActions.cancel);
  };

  public func withdrawDeposit(taskId: Nat) : async {
    if (tasks[taskId].creator != Principal.fromActor(Principal.fromActorId(Call.caller))
        || tasks[taskId].deposit == 0
        || (tasks[taskId].status == TaskStatus.cancelled
            && Prim.vec_len(applicants[taskId]) == 0)
        || (tasks[taskId].status == TaskStatus.cancelled
            && Time.diff(Time.now(), Time.sub(tasks[taskId].createdTime, unlockTime)) < 0)) {
      assert(false, "Cannot withdraw");
    }

    let valueToWithdraw : Nat = tasks[taskId].deposit;
    tasks[taskId].deposit := 0;
    Call.caller_balance.transfer(valueToWithdraw);

    emit TaskUpdate(taskId, Principal.fromActor(Principal.fromActorId(Call.caller)), TaskActions.withdraw);
  };

  public func applyTask(taskId: Nat) : async {
    if (tasks[taskId].status != TaskStatus.active
        || tasks[taskId].creator == Principal.fromActor(Principal.fromActorId(Call.caller))) {
      assert(false, "Task not found or you are the creator");
    }

    let currentApp : [Principal] = Prim.vec_append(applicants[taskId], [Principal.fromActor(Principal.fromActorId(Call.caller))]);
    applicants[taskId] := currentApp;

    let myApp : [Nat] = Prim.vec_append(appliedTasks[Principal.fromActor(Principal.fromActorId(Call.caller))], [taskId]);
    appliedTasks[Principal.fromActor(Principal.fromActorId(Call.caller))] := myApp;

    emit TaskUpdate(taskId, Principal.fromActor(Principal.fromActorId(Call.caller)), TaskActions.applyTask);
  };

};
