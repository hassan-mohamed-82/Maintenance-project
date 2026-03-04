// src/controllers/admin/garages.ts

import { Request, Response } from "express";
import { db } from "../../models/db";
import { garages, cities, zones } from "../../models/schema";
import { eq, desc, and } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";
import { BadRequest } from "../../Errors/BadRequest";
import zone from "../../routes/admins/zone";

// ✅ Create Garage
export const createGarage = async (req: Request, res: Response) => {
  const { name, cityId, location } = req.body;

  if (!name) throw new BadRequest("name is required");
  if (!cityId) throw new BadRequest("cityId is required");
  if (!location) throw new BadRequest("location is required");

  // تحقق من وجود المدينة
  const city = await db
    .select()
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  if (city.length === 0) {
    throw new NotFound("City not found");
  }
  


  await db.insert(garages).values({ name, cityId,location });

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
  const { name, cityId, location } = req.body;

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


    if (location.length === 0) {
      throw new NotFound("location is required");
    }

  await db
    .update(garages)
    .set({
      name: name || garage[0].name,
      cityId: cityId || garage[0].cityId,
      location: location || garage[0].location,
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


export const getCitiesWithZones = async (req: Request, res: Response) => {
  // جلب كل المدن
  const cityList = await db
    .select()
    .from(cities)
    .orderBy(desc(cities.createdAt));

  

  return SuccessResponse(res, {
    totalCities: cityList.length
  }, 200);
};
