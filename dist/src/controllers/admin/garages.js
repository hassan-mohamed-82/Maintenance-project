"use strict";
// src/controllers/admin/garages.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitiesWithZones = exports.getGaragesSelection = exports.deleteGarage = exports.updateGarage = exports.getGarageById = exports.getGarages = exports.createGarage = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const BadRequest_1 = require("../../Errors/BadRequest");
// ✅ Create Garage
const createGarage = async (req, res) => {
    const { name, cityId, zoneId } = req.body;
    if (!name)
        throw new BadRequest_1.BadRequest("name is required");
    if (!cityId)
        throw new BadRequest_1.BadRequest("cityId is required");
    if (!zoneId)
        throw new BadRequest_1.BadRequest("zoneId is required");
    // تحقق من وجود المدينة
    const city = await db_1.db
        .select()
        .from(schema_1.cities)
        .where((0, drizzle_orm_1.eq)(schema_1.cities.id, cityId))
        .limit(1);
    if (city.length === 0) {
        throw new NotFound_1.NotFound("City not found");
    }
    // تحقق من وجود المنطقة
    const zone = await db_1.db
        .select()
        .from(schema_1.zones)
        .where((0, drizzle_orm_1.eq)(schema_1.zones.id, zoneId))
        .limit(1);
    if (zone.length === 0) {
        throw new NotFound_1.NotFound("Zone not found");
    }
    await db_1.db.insert(schema_1.garages).values({ name, cityId, zoneId });
    return (0, response_1.SuccessResponse)(res, { message: "Garage created successfully" }, 201);
};
exports.createGarage = createGarage;
// ✅ Get All Garages
const getGarages = async (req, res) => {
    const { cityId, zoneId } = req.query;
    // Build where conditions
    const conditions = [];
    if (cityId && typeof cityId === "string") {
        conditions.push((0, drizzle_orm_1.eq)(schema_1.garages.cityId, cityId));
    }
    if (zoneId && typeof zoneId === "string") {
        conditions.push((0, drizzle_orm_1.eq)(schema_1.garages.zoneId, zoneId));
    }
    const garageList = await db_1.db
        .select({
        id: schema_1.garages.id,
        name: schema_1.garages.name,
        createdAt: schema_1.garages.createdAt,
        city: {
            id: schema_1.cities.id,
            name: schema_1.cities.name,
        },
        zone: {
            id: schema_1.zones.id,
            name: schema_1.zones.name,
        },
    })
        .from(schema_1.garages)
        .leftJoin(schema_1.cities, (0, drizzle_orm_1.eq)(schema_1.garages.cityId, schema_1.cities.id))
        .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.garages.zoneId, schema_1.zones.id))
        .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.garages.createdAt));
    return (0, response_1.SuccessResponse)(res, { garages: garageList }, 200);
};
exports.getGarages = getGarages;
// ✅ Get Garage By ID
const getGarageById = async (req, res) => {
    const { id } = req.params;
    const garage = await db_1.db
        .select({
        id: schema_1.garages.id,
        name: schema_1.garages.name,
        createdAt: schema_1.garages.createdAt,
        city: {
            id: schema_1.cities.id,
            name: schema_1.cities.name,
        },
        zone: {
            id: schema_1.zones.id,
            name: schema_1.zones.name,
        },
    })
        .from(schema_1.garages)
        .leftJoin(schema_1.cities, (0, drizzle_orm_1.eq)(schema_1.garages.cityId, schema_1.cities.id))
        .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.garages.zoneId, schema_1.zones.id))
        .where((0, drizzle_orm_1.eq)(schema_1.garages.id, id))
        .limit(1);
    if (garage.length === 0) {
        throw new NotFound_1.NotFound("Garage not found");
    }
    return (0, response_1.SuccessResponse)(res, { garage: garage[0] }, 200);
};
exports.getGarageById = getGarageById;
// ✅ Update Garage
const updateGarage = async (req, res) => {
    const { id } = req.params;
    const { name, cityId, zoneId } = req.body;
    const garage = await db_1.db
        .select()
        .from(schema_1.garages)
        .where((0, drizzle_orm_1.eq)(schema_1.garages.id, id))
        .limit(1);
    if (garage.length === 0) {
        throw new NotFound_1.NotFound("Garage not found");
    }
    if (cityId) {
        const city = await db_1.db
            .select()
            .from(schema_1.cities)
            .where((0, drizzle_orm_1.eq)(schema_1.cities.id, cityId))
            .limit(1);
        if (city.length === 0) {
            throw new NotFound_1.NotFound("City not found");
        }
    }
    if (zoneId) {
        const zone = await db_1.db
            .select()
            .from(schema_1.zones)
            .where((0, drizzle_orm_1.eq)(schema_1.zones.id, zoneId))
            .limit(1);
        if (zone.length === 0) {
            throw new NotFound_1.NotFound("Zone not found");
        }
    }
    await db_1.db
        .update(schema_1.garages)
        .set({
        name: name || garage[0].name,
        cityId: cityId || garage[0].cityId,
        zoneId: zoneId || garage[0].zoneId,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.garages.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Garage updated successfully" }, 200);
};
exports.updateGarage = updateGarage;
// ✅ Delete Garage
const deleteGarage = async (req, res) => {
    const { id } = req.params;
    const garage = await db_1.db
        .select()
        .from(schema_1.garages)
        .where((0, drizzle_orm_1.eq)(schema_1.garages.id, id))
        .limit(1);
    if (garage.length === 0) {
        throw new NotFound_1.NotFound("Garage not found");
    }
    await db_1.db.delete(schema_1.garages).where((0, drizzle_orm_1.eq)(schema_1.garages.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Garage deleted successfully" }, 200);
};
exports.deleteGarage = deleteGarage;
// ✅ Get Garages Selection
const getGaragesSelection = async (req, res) => {
    const garageList = await db_1.db
        .select({
        id: schema_1.garages.id,
        name: schema_1.garages.name,
    })
        .from(schema_1.garages)
        .orderBy(schema_1.garages.name);
    return (0, response_1.SuccessResponse)(res, { garages: garageList }, 200);
};
exports.getGaragesSelection = getGaragesSelection;
const getCitiesWithZones = async (req, res) => {
    // جلب كل المدن
    const cityList = await db_1.db
        .select()
        .from(schema_1.cities)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.cities.createdAt));
    // جلب كل المناطق
    const zoneList = await db_1.db
        .select({
        id: schema_1.zones.id,
        name: schema_1.zones.name,
        cityId: schema_1.zones.cityId,
    })
        .from(schema_1.zones)
        .orderBy(schema_1.zones.name);
    // تجميع المناطق مع المدن
    const citiesWithZones = cityList.map((city) => ({
        id: city.id,
        name: city.name,
        createdAt: city.createdAt,
        zones: zoneList.filter((zone) => zone.cityId === city.id),
        zonesCount: zoneList.filter((zone) => zone.cityId === city.id).length,
    }));
    return (0, response_1.SuccessResponse)(res, {
        cities: citiesWithZones,
        totalCities: cityList.length,
        totalZones: zoneList.length,
    }, 200);
};
exports.getCitiesWithZones = getCitiesWithZones;
