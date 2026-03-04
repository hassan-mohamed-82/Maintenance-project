"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenance_type = exports.deleteMaintenance = exports.updateMaintenance = exports.createMaintenance = exports.getMaintenanceById = exports.getAllMaintenances = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const BadRequest_1 = require("../../Errors/BadRequest");
// ✅ Get All Maintenances
const getAllMaintenances = async (req, res) => {
    const allMaintenances = await db_1.db
        .select({
        id: schema_1.maintenances.id,
        name: schema_1.maintenances.name,
        maintenanceTypeId: schema_1.maintenances.maintenanceTypeId,
        createdAt: schema_1.maintenances.createdAt,
        updatedAt: schema_1.maintenances.updatedAt,
        maintenanceType: {
            id: schema_1.maintenanceTypes.id,
            name: schema_1.maintenanceTypes.name,
        },
    })
        .from(schema_1.maintenances)
        .leftJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenances.maintenanceTypeId, schema_1.maintenanceTypes.id));
    (0, response_1.SuccessResponse)(res, { maintenances: allMaintenances }, 200);
};
exports.getAllMaintenances = getAllMaintenances;
// ✅ Get Maintenance By ID
const getMaintenanceById = async (req, res) => {
    const { id } = req.params;
    const [maintenance] = await db_1.db
        .select({
        id: schema_1.maintenances.id,
        name: schema_1.maintenances.name,
        maintenanceTypeId: schema_1.maintenances.maintenanceTypeId,
        createdAt: schema_1.maintenances.createdAt,
        updatedAt: schema_1.maintenances.updatedAt,
        maintenanceType: {
            id: schema_1.maintenanceTypes.id,
            name: schema_1.maintenanceTypes.name,
        },
    })
        .from(schema_1.maintenances)
        .leftJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenances.maintenanceTypeId, schema_1.maintenanceTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id))
        .limit(1);
    if (!maintenance) {
        throw new NotFound_1.NotFound("Maintenance not found");
    }
    (0, response_1.SuccessResponse)(res, { maintenance }, 200);
};
exports.getMaintenanceById = getMaintenanceById;
// ✅ Create Maintenance
const createMaintenance = async (req, res) => {
    const { name, maintenanceTypeId } = req.body;
    // Validate Maintenance Type ID
    const [typeExists] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, maintenanceTypeId))
        .limit(1);
    if (!typeExists) {
        throw new BadRequest_1.BadRequest("Invalid Maintenance Type ID");
    }
    const newId = (0, uuid_1.v4)();
    await db_1.db.insert(schema_1.maintenances).values({
        id: newId,
        name,
        maintenanceTypeId,
    });
    const [createdMaintenance] = await db_1.db
        .select()
        .from(schema_1.maintenances)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, newId))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Maintenance created successfully", maintenance: createdMaintenance }, 201);
};
exports.createMaintenance = createMaintenance;
// ✅ Update Maintenance
const updateMaintenance = async (req, res) => {
    const { id } = req.params;
    const { name, maintenanceTypeId } = req.body;
    const [existingMaintenance] = await db_1.db
        .select()
        .from(schema_1.maintenances)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id))
        .limit(1);
    if (!existingMaintenance) {
        throw new NotFound_1.NotFound("Maintenance not found");
    }
    if (maintenanceTypeId) {
        const [typeExists] = await db_1.db
            .select()
            .from(schema_1.maintenanceTypes)
            .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, maintenanceTypeId))
            .limit(1);
        if (!typeExists) {
            throw new BadRequest_1.BadRequest("Invalid Maintenance Type ID");
        }
    }
    await db_1.db.update(schema_1.maintenances).set({
        name: name ?? existingMaintenance.name,
        maintenanceTypeId: maintenanceTypeId ?? existingMaintenance.maintenanceTypeId
    }).where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id));
    const [updatedMaintenance] = await db_1.db
        .select()
        .from(schema_1.maintenances)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Maintenance updated successfully", maintenance: updatedMaintenance }, 200);
};
exports.updateMaintenance = updateMaintenance;
// ✅ Delete Maintenance
const deleteMaintenance = async (req, res) => {
    const { id } = req.params;
    const [existingMaintenance] = await db_1.db
        .select()
        .from(schema_1.maintenances)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id))
        .limit(1);
    if (!existingMaintenance) {
        throw new NotFound_1.NotFound("Maintenance not found");
    }
    await db_1.db.delete(schema_1.maintenances).where((0, drizzle_orm_1.eq)(schema_1.maintenances.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Maintenance deleted successfully" }, 200);
};
exports.deleteMaintenance = deleteMaintenance;
const maintenance_type = async (req, res) => {
    const allTypes = await db_1.db.select().from(schema_1.maintenanceTypes);
    (0, response_1.SuccessResponse)(res, { maintenanceTypes: allTypes }, 200);
};
exports.maintenance_type = maintenance_type;
