"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaintenanceType = exports.updateMaintenanceType = exports.createMaintenanceType = exports.getMaintenanceTypeById = exports.getAllMaintenanceTypes = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
// ✅ Get All Maintenance Types
const getAllMaintenanceTypes = async (req, res) => {
    const allTypes = await db_1.db.select().from(schema_1.maintenanceTypes);
    (0, response_1.SuccessResponse)(res, { maintenanceTypes: allTypes }, 200);
};
exports.getAllMaintenanceTypes = getAllMaintenanceTypes;
// ✅ Get Maintenance Type By ID
const getMaintenanceTypeById = async (req, res) => {
    const { id } = req.params;
    const [type] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id))
        .limit(1);
    if (!type) {
        throw new NotFound_1.NotFound("Maintenance Type not found");
    }
    (0, response_1.SuccessResponse)(res, { maintenanceType: type }, 200);
};
exports.getMaintenanceTypeById = getMaintenanceTypeById;
// ✅ Create Maintenance Type
const createMaintenanceType = async (req, res) => {
    const { name } = req.body;
    const newId = (0, uuid_1.v4)();
    await db_1.db.insert(schema_1.maintenanceTypes).values({
        id: newId,
        name,
    });
    const [createdType] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, newId))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Maintenance Type created successfully", maintenanceType: createdType }, 201);
};
exports.createMaintenanceType = createMaintenanceType;
// ✅ Update Maintenance Type
const updateMaintenanceType = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const [existingType] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id))
        .limit(1);
    if (!existingType) {
        throw new NotFound_1.NotFound("Maintenance Type not found");
    }
    await db_1.db.update(schema_1.maintenanceTypes).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id));
    const [updatedType] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Maintenance Type updated successfully", maintenanceType: updatedType }, 200);
};
exports.updateMaintenanceType = updateMaintenanceType;
// ✅ Delete Maintenance Type
const deleteMaintenanceType = async (req, res) => {
    const { id } = req.params;
    const [existingType] = await db_1.db
        .select()
        .from(schema_1.maintenanceTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id))
        .limit(1);
    if (!existingType) {
        throw new NotFound_1.NotFound("Maintenance Type not found");
    }
    await db_1.db.delete(schema_1.maintenanceTypes).where((0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Maintenance Type deleted successfully" }, 200);
};
exports.deleteMaintenanceType = deleteMaintenanceType;
