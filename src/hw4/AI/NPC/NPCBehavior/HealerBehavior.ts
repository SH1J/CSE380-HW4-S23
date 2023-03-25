import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import GoalReached from "../NPCStatuses/FalseStatus";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Idle from "../NPCActions/GotoAction";
import { TargetExists } from "../NPCStatuses/TargetExists";
import BasicFinder from "../../../GameSystems/Searching/BasicFinder";
import { ClosestPositioned } from "../../../GameSystems/Searching/HW4Reducers";
import { BattlerActiveFilter, BattlerGroupFilter, BattlerHealthFilter, ItemFilter, RangeFilter, VisibleItemFilter } from "../../../GameSystems/Searching/HW4Filters";
import PickupItem from "../NPCActions/PickupItem";
import UseHealthpack from "../NPCActions/UseHealthpack";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import Item from "../../../GameSystems/ItemSystem/Item";
import { HasItem } from "../NPCStatuses/HasItem";
import FalseStatus from "../NPCStatuses/FalseStatus";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";


/**
 * When an NPC is acting as a healer, their goal is to try and heal it's teammates by running around, picking up healthpacks, 
 * bringing to the healthpacks to their allies and healing them.
 */
export default class HealerBehavior extends NPCBehavior  {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;
    
    /** Initialize the NPC AI */
    public initializeAI(owner: NPCActor, opts: Record<string, any>): void {
        super.initializeAI(owner, opts);
        // TODO configure the rest of the healer actions
        /* ######### Set the healers goal ######## */

        // sets statuses
        this.initializeStatuses();
        // sets actions
        this.initalizeActions();

        this.goal = HealerStatuses.GOAL;
        this.initialize();
    }

    public override handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public override update(deltaT: number): void {
        super.update(deltaT);
    }

    /* ######### Add all healer statuses ######## */
    protected initializeStatuses(): void {

        let scene = this.owner.getScene();

        // Check if a lowhealth ally exists in the scene
        //let lowhealthAlly = new BasicFinder<Battler>(null, BattlerActiveFilter(), BattlerGroupFilter([this.owner.battleGroup]));
        let lowhealthAlly = new BasicFinder<Battler>(null, BattlerHealthFilter(0, this.owner.maxHealth/2), BattlerGroupFilter([this.owner.battleGroup]));
        this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowhealthAlly));

        // Check if a healthpack exists in the scene and it's visible
        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));

        // Check if a healthpack exists in the actors inventory
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(this.owner, new BasicFinder<Item>(null, ItemFilter(Healthpack))));

        // Add the goal status 
        this.addStatus(HealerStatuses.GOAL, new FalseStatus());
    }

    /* ######### Add all healer actions ######## */
    protected initalizeActions(): void {
        let scene = this.owner.getScene();
        
        // State 1
        let pickHealthPack = new PickupItem(this, this.owner);
        pickHealthPack.targets = scene.getHealthpacks();
        pickHealthPack.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(Healthpack));
        pickHealthPack.addPrecondition(HealerStatuses.HPACK_EXISTS);
        pickHealthPack.addEffect(HealerStatuses.HAS_HPACK);
        pickHealthPack.cost = 5;
        this.addState(HealerActions.PICKUP_HPACK, pickHealthPack);

        // State 2
        let healAlly = new UseHealthpack(this, this.owner);
        healAlly.targets = scene.getBattlers();
        healAlly.targetFinder = new BasicFinder<Battler>(ClosestPositioned(this.owner), BattlerActiveFilter(), BattlerGroupFilter([this.owner.battleGroup]));
        healAlly.addPrecondition(HealerStatuses.ALLY_EXISTS);
        healAlly.addPrecondition(HealerStatuses.HAS_HPACK);
        healAlly.cost = 1;
        this.addState(HealerActions.USE_HPACK, healAlly);

        // Idle action ... State 3
        let idle = new Idle(this, this.owner);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 100;
        this.addState(HealerActions.IDLE, idle);
    }
}



// World states for the healer
const HealerStatuses = {

    // Whether or not a healthpack exists in the world
    HPACK_EXISTS: "hpack-exists",

    // Whether the healer has a healthpack in their inventory or not
    ALLY_EXISTS: "ally-exists",

    // Whether the healer has any allies in the game world or not
    HAS_HPACK: "has-hpack",

    // Whether the healer has reached it's goal or not
    GOAL: "goal"

} as const

// Healer actions
const HealerActions = {

    PICKUP_HPACK: "pickup-hpack",

    USE_HPACK: "use-hpack",

    IDLE: "idle",

} as const;

