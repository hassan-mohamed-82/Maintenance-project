// src/controllers/admin/garages.ts

import { Request, Response } from "express";
import { db } from "../../models/db";
import { garages, cities, zones } from "../../models/schema";
import { eq, desc, and } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";
import { BadRequest } from "../../Errors/BadRequest";

// ✅ Create Garage
export const createGarage = async (req: Request, res: Response) => {
  const { name, cityId, zoneId } = req.body;

  if (!name) throw new BadRequest("name is required");
  if (!cityId) throw new BadRequest("cityId is required");
  if (!zoneId) throw new BadRequest("zoneId is required");

  // تحقق من وجود المدينة
  const city = await db
    .select()
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  if (city.length === 0) {
    throw new NotFound("City not found");
  }

  // تحقق من وجود المنطقة
  const zone = await db
    .select()
    .from(zones)
    .where(eq(zones.id, zoneId))
    .limit(1);

  if (zone.length === 0) {
    throw new NotFound("Zone not found");
  }

  await db.insert(garages).values({ name, cityId, zoneId });

  return SuccessResponse(res, { message: "Garage created successfully" }, 201);
};

// ✅ Get All Garages
export const getGarages = async (req: Request, res: Response) => {
  const { cityId, zoneId } = req.query;

  // Build where conditions
  const conditions = [];
  if (cityId && typeof cityId === "string") {
    conditions.push(eq(garages.cityId, cityId));
  }
  if (zoneId && typeof zoneId === "string") {
    conditions.push(eq(garages.zoneId, zoneId));
  }

  const garageList = await db
    .select({
      id: garages.id,
      name: garages.name,
      createdAt: garages.createdAt,
      city: {
        id: cities.id,
        name: cities.name,
      },
      zone: {
        id: zones.id,
        name: zones.name,
      },
    })
    .from(garages)
    .leftJoin(cities, eq(garages.cityId, cities.id))
    .leftJoin(zones, eq(garages.zoneId, zones.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(garages.createdAt));

  return SuccessResponse(res, { garages: garageList }, 200);
};

// ✅ Get Garage By ID
export const getGarageById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const garage = await db
    .select({
      id: garages.id,
      name: garages.name,
      createdAt: garages.createdAt,
      city: {
        id: cities.id,
        name: cities.name,
      },
      zone: {
        id: zones.id,
        name: zones.name,
      },
    })
    .from(garages)
    .leftJoin(cities, eq(garages.cityId, cities.id))
    .leftJoin(zones, eq(garages.zoneId, zones.id))
    .where(eq(garages.id, id))
    .limit(1);

  if (garage.length === 0) {
    throw new NotFound("Garage not found");
  }

  return SuccessResponse(res, { garage: garage[0] }, 200);
};

// ✅ Update Garage
export const updateGarage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, cityId, zoneId } = req.body;

  const garage = await db
    .select()
    .from(garages)
    .where(eq(garages.id, id))
    .limit(1);

  if (garage.length === 0) {
    throw new NotFound("Garage not found");
  }

  if (cityId) {
    const city = await db
      .select()
      .from(cities)
      .where(eq(cities.id, cityId))
      .limit(1);

    if (city.length === 0) {
      throw new NotFound("City not found");
    }
  }

  if (zoneId) {
    const zone = await db
      .select()
      .from(zones)
      .where(eq(zones.id, zoneId))
      .limit(1);

    if (zone.length === 0) {
      throw new NotFound("Zone not found");
    }
  }

  await db
    .update(garages)
    .set({
      name: name || garage[0].name,
      cityId: cityId || garage[0].cityId,
      zoneId: zoneId || garage[0].zoneId,
    })
    .where(eq(garages.id, id));

  return SuccessResponse(res, { message: "Garage updated successfully" }, 200);
};

// ✅ Delete Garage
export const deleteGarage = async (req: Request, res: Response) => {
  const { id } = req.params;

  const garage = await db
    .select()
    .from(garages)
    .where(eq(garages.id, id))
    .limit(1);

  if (garage.length === 0) {
    throw new NotFound("Garage not found");
  }

  await db.delete(garages).where(eq(garages.id, id));

  return SuccessResponse(res, { message: "Garage deleted successfully" }, 200);
};

// ✅ Get Garages Selection
export const getGaragesSelection = async (req: Request, res: Response) => {
  const garageList = await db
    .select({
      id: garages.id,
      name: garages.name,
    })
    .from(garages)
    .orderBy(garages.name);

  return SuccessResponse(res, { garages: garageList }, 200);
};

export const getCitiesWithZones = async (req: Request, res: Response) => {
  // جلب كل المدن
  const cityList = await db
    .select()
    .from(cities)
    .orderBy(desc(cities.createdAt));

  // جلب كل المناطق
  const zoneList = await db
    .select({
      id: zones.id,
      name: zones.name,
      cityId: zones.cityId,
    })
    .from(zones)
    .orderBy(zones.name);

  // تجميع المناطق مع المدن
  const citiesWithZones = cityList.map((city) => ({
    id: city.id,
    name: city.name,
    createdAt: city.createdAt,
    zones: zoneList.filter((zone) => zone.cityId === city.id),
    zonesCount: zoneList.filter((zone) => zone.cityId === city.id).length,
  }));

  return SuccessResponse(res, {
    cities: citiesWithZones,
    totalCities: cityList.length,
    totalZones: zoneList.length,
  }, 200);
};
