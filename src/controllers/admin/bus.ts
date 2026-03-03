// src/controllers/admin/busController.ts

import { Request, Response } from "express";
import { db } from "../../models/db";
import { buses, busTypes } from "../../models/schema";
import { eq, and, count, desc, gte, lte } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";
import { BadRequest } from "../../Errors/BadRequest";
import { saveBase64Image } from "../../utils/handleImages";
import { deletePhotoFromServer } from "../../utils/deleteImage";
import { v4 as uuidv4 } from "uuid";

export const getAllBuses = async (req: Request, res: Response) => {
  const allBuses = await db
    .select({
      id: buses.id,
      busNumber: buses.busNumber,
      plateNumber: buses.plateNumber,
      maxSeats: buses.maxSeats,
      licenseNumber: buses.licenseNumber,
      licenseExpiryDate: buses.licenseExpiryDate,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      createdAt: buses.createdAt,
      updatedAt: buses.updatedAt,
      busType: {
        id: busTypes.id,
        name: busTypes.name,
        capacity: busTypes.capacity,
      },
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id));

  SuccessResponse(res, { buses: allBuses }, 200);
};

// ✅ Get Bus By ID
export const getBusById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const bus = await db
    .select({
      id: buses.id,
      busNumber: buses.busNumber,
      plateNumber: buses.plateNumber,
      maxSeats: buses.maxSeats,
      licenseNumber: buses.licenseNumber,
      licenseExpiryDate: buses.licenseExpiryDate,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      createdAt: buses.createdAt,
      updatedAt: buses.updatedAt,
      busType: {
        id: busTypes.id,
        name: busTypes.name,
        capacity: busTypes.capacity,
        description: busTypes.description,
      },
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id))
    .where(eq(buses.id, id))
    .limit(1);

  if (!bus[0]) {
    throw new NotFound("Bus not found");
  }

  SuccessResponse(res, { bus: bus[0] }, 200);
};

export const createBus = async (req: Request, res: Response) => {
  const {
    busTypeId,
    plateNumber,
    busNumber,
    maxSeats,
    licenseNumber,
    licenseExpiryDate,
    licenseImage,
    busImage,
  } = req.body;

  // تحقق من وجود الـ Bus Type
  const busType = await db
    .select()
    .from(busTypes)
    .where(eq(busTypes.id, busTypeId))
    .limit(1);

  if (!busType[0]) {
    throw new NotFound("Bus Type not found");
  }

  // تحقق من عدم تكرار رقم اللوحة
  const existingPlate = await db
    .select()
    .from(buses)
    .where(eq(buses.plateNumber, plateNumber))
    .limit(1);

  if (existingPlate[0]) {
    throw new BadRequest("Plate Number already exists");
  }

  // تحقق من عدم تكرار رقم الباص
  const existingBusNumber = await db
    .select()
    .from(buses)
    .where(eq(buses.busNumber, busNumber))
    .limit(1);

  if (existingBusNumber[0]) {
    throw new BadRequest("Bus Number already exists");
  }

  // حفظ الصور
  let savedLicenseImage: string | null = null;
  let savedBusImage: string | null = null;

  if (licenseImage) {
    const result = await saveBase64Image(req, licenseImage, "buses/licenses");
    savedLicenseImage = result.url;
  }

  if (busImage) {
    const result = await saveBase64Image(req, busImage, "buses/photos");
    savedBusImage = result.url;
  }

  // توليد ID
  const newBusId = uuidv4();

  await db.insert(buses).values({
    id: newBusId,
    busTypeId,
    plateNumber,
    busNumber,
    maxSeats,
    licenseNumber: licenseNumber || null,
    licenseExpiryDate: licenseExpiryDate || null,
    licenseImage: savedLicenseImage,
    busImage: savedBusImage,
  });

  // جلب الباص الجديد
  const [createdBus] = await db
    .select({
      id: buses.id,
      busNumber: buses.busNumber,
      plateNumber: buses.plateNumber,
      maxSeats: buses.maxSeats,
      licenseNumber: buses.licenseNumber,
      licenseExpiryDate: buses.licenseExpiryDate,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      createdAt: buses.createdAt,
      busType: {
        id: busTypes.id,
        name: busTypes.name,
        capacity: busTypes.capacity,
      },
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id))
    .where(eq(buses.id, newBusId))
    .limit(1);


  SuccessResponse(
    res,
    { message: "Bus created successfully", bus: createdBus },
    201
  );
};

// ✅ Update Bus
export const updateBus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    busTypeId,
    busNumber,
    plateNumber,
    maxSeats,
    licenseNumber,
    licenseExpiryDate,
    licenseImage,
    busImage,
    status,
  } = req.body;

  // تحقق من وجود الباص
  const existingBus = await db
    .select()
    .from(buses)
    .where(eq(buses.id, id))
    .limit(1);

  if (!existingBus[0]) {
    throw new NotFound("Bus not found");
  }

  const bus = existingBus[0];

  // لو بيغير الـ Bus Type، نتحقق إنه موجود
  if (busTypeId && busTypeId !== bus.busTypeId) {
    const busType = await db
      .select()
      .from(busTypes)
      .where(eq(busTypes.id, busTypeId))
      .limit(1);

    if (!busType[0]) {
      throw new BadRequest("Bus Type not found");
    }
  }

  // لو بيغير رقم اللوحة، نتحقق إنه مش مكرر
  if (plateNumber && plateNumber !== bus.plateNumber) {
    const existingPlate = await db
      .select()
      .from(buses)
      .where(eq(buses.plateNumber, plateNumber))
      .limit(1);

    if (existingPlate[0]) {
      throw new BadRequest("Plate Number already exists");
    }
  }

  // لو بيغير رقم الباص، نتحقق إنه مش مكرر 
  if (busNumber && busNumber !== bus.busNumber) {
    const existingBusNumber = await db
      .select()
      .from(buses)
      .where(eq(buses.busNumber, busNumber))
      .limit(1);

    if (existingBusNumber[0]) {
      throw new BadRequest("Bus Number already exists");
    }
  }

  // Validate status if provided
  if (status && !["active", "inactive", "maintenance"].includes(status)) {
    throw new BadRequest(
      "Invalid status. Must be: active, inactive, or maintenance"
    );
  }

  // التعامل مع صورة الرخصة
  let savedLicenseImage = bus.licenseImage;
  if (licenseImage !== undefined) {
    if (licenseImage) {
      const result = await saveBase64Image(req, licenseImage, "buses/licenses");
      // حذف الصورة القديمة بعد حفظ الجديدة بنجاح
      if (bus.licenseImage) {
        await deletePhotoFromServer(bus.licenseImage);
      }
      savedLicenseImage = result.url;
    } else {
      // حذف الصورة القديمة
      if (bus.licenseImage) {
        await deletePhotoFromServer(bus.licenseImage);
      }
      savedLicenseImage = null;
    }
  }

  // التعامل مع صورة الباص
  let savedBusImage = bus.busImage;
  if (busImage !== undefined) {
    if (busImage) {
      const result = await saveBase64Image(req, busImage, "buses/photos");
      // حذف الصورة القديمة بعد حفظ الجديدة بنجاح
      if (bus.busImage) {
        await deletePhotoFromServer(bus.busImage);
      }
      savedBusImage = result.url;
    } else {
      // حذف الصورة القديمة
      if (bus.busImage) {
        await deletePhotoFromServer(bus.busImage);
      }
      savedBusImage = null;
    }
  }

  await db
    .update(buses)
    .set({
      busTypeId: busTypeId ?? bus.busTypeId,
      busNumber: busNumber ?? bus.busNumber,
      plateNumber: plateNumber ?? bus.plateNumber,
      maxSeats: maxSeats ?? bus.maxSeats,
      licenseNumber:
        licenseNumber !== undefined ? licenseNumber : bus.licenseNumber,
      licenseExpiryDate:
        licenseExpiryDate !== undefined
          ? licenseExpiryDate
          : bus.licenseExpiryDate,
      licenseImage: savedLicenseImage,
      busImage: savedBusImage,
      status: status ?? bus.status,
    })
    .where(eq(buses.id, id));

  // جلب الباص المحدث
  const [updatedBus] = await db
    .select({
      id: buses.id,
      busNumber: buses.busNumber,
      plateNumber: buses.plateNumber,
      maxSeats: buses.maxSeats,
      licenseNumber: buses.licenseNumber,
      licenseExpiryDate: buses.licenseExpiryDate,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      updatedAt: buses.updatedAt,
      busType: {
        id: busTypes.id,
        name: busTypes.name,
        capacity: busTypes.capacity,
      },
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id))
    .where(eq(buses.id, id))
    .limit(1);

  SuccessResponse(
    res,
    { message: "Bus updated successfully", bus: updatedBus },
    200
  );
};

// ✅ Delete Bus
export const deleteBus = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBus = await db
    .select()
    .from(buses)
    .where(eq(buses.id, id))
    .limit(1);

  if (!existingBus[0]) {
    throw new NotFound("Bus not found");
  }

  // Check if bus has associated rides - Rides model is currently removed from query

  // حذف الصور من السيرفر
  if (existingBus[0].licenseImage) {
    await deletePhotoFromServer(existingBus[0].licenseImage);
  }
  if (existingBus[0].busImage) {
    await deletePhotoFromServer(existingBus[0].busImage);
  }

  await db.delete(buses).where(eq(buses.id, id));

  SuccessResponse(res, { message: "Bus deleted successfully" }, 200);
};

// ✅ Update Bus Status
export const updateBusStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new BadRequest("Status is required");
  }

  if (!["active", "inactive", "maintenance"].includes(status)) {
    throw new BadRequest(
      "Invalid status. Must be: active, inactive, or maintenance"
    );
  }

  const existingBus = await db
    .select()
    .from(buses)
    .where(eq(buses.id, id))
    .limit(1);

  if (!existingBus[0]) {
    throw new NotFound("Bus not found");
  }

  await db.update(buses).set({ status }).where(eq(buses.id, id));

  SuccessResponse(res, { message: `Bus status updated to ${status}` }, 200);
};

// ✅ Get Buses By Status
export const getBusesByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;

  if (!["active", "inactive", "maintenance"].includes(status)) {
    throw new BadRequest(
      "Invalid status. Must be: active, inactive, or maintenance"
    );
  }

  const filteredBuses = await db
    .select({
      id: buses.id,
      busNumber: buses.busNumber,
      plateNumber: buses.plateNumber,
      maxSeats: buses.maxSeats,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      busType: {
        id: busTypes.id,
        name: busTypes.name,
        capacity: busTypes.capacity,
      },
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id))
    .where(eq(buses.status, status as "active" | "inactive" | "maintenance"));

  SuccessResponse(
    res,
    {
      buses: filteredBuses,
      count: filteredBuses.length,
      status: status,
    },
    200
  );
};

// ✅ Get Bus Statistics (جديد)
export const getBusStatistics = async (req: Request, res: Response) => {
  // عدد الباصات حسب الحالة
  const allBuses = await db
    .select({ status: buses.status })
    .from(buses);

  const stats = {
    total: allBuses.length,
    active: allBuses.filter((b) => b.status === "active").length,
    inactive: allBuses.filter((b) => b.status === "inactive").length,
    maintenance: allBuses.filter((b) => b.status === "maintenance").length,
  };

  SuccessResponse(
    res,
    {
      statistics: stats,
    },
    200
  );
};

export const getBusTypes = async (req: Request, res: Response) => {
  const allBusTypes = await db.select().from(busTypes);
  SuccessResponse(res, { busTypes: allBusTypes }, 200);
};



// ✅ 2) GET BUS FULL DETAILS
// ============================================
export const getBusDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1) بيانات الباص الأساسية مع Bus Type
  const [bus] = await db
    .select({
      id: buses.id,
      plateNumber: buses.plateNumber,
      busNumber: buses.busNumber,
      maxSeats: buses.maxSeats,
      licenseNumber: buses.licenseNumber,
      licenseExpiryDate: buses.licenseExpiryDate,
      licenseImage: buses.licenseImage,
      busImage: buses.busImage,
      status: buses.status,
      createdAt: buses.createdAt,
      updatedAt: buses.updatedAt,
      // Bus Type
      busTypeId: busTypes.id,
      busTypeName: busTypes.name,
    })
    .from(buses)
    .leftJoin(busTypes, eq(buses.busTypeId, busTypes.id))
    .where(eq(buses.id, id))
    .limit(1);

  if (!bus) {
    throw new NotFound("Bus not found");
  }

  // 6) إحصائيات مبسطة (لعدم وجود الجداول الأخرى)
  const stats = {
    maxSeats: bus.maxSeats,
    // حالة الرخصة
    licenseStatus: bus.licenseExpiryDate
      ? new Date(bus.licenseExpiryDate) > new Date()
        ? 'valid'
        : 'expired'
      : 'unknown',
    daysUntilLicenseExpiry: bus.licenseExpiryDate
      ? Math.ceil((new Date(bus.licenseExpiryDate).getTime() - Date.now()) / 86400000)
      : null,
  };

  SuccessResponse(
    res,
    {
      bus: {
        id: bus.id,
        plateNumber: bus.plateNumber,
        busNumber: bus.busNumber,
        maxSeats: bus.maxSeats,
        licenseNumber: bus.licenseNumber,
        licenseExpiryDate: bus.licenseExpiryDate,
        licenseImage: bus.licenseImage,
        busImage: bus.busImage,
        status: bus.status,
        createdAt: bus.createdAt,
        updatedAt: bus.updatedAt,
        busType: bus.busTypeId ? {
          id: bus.busTypeId,
          name: bus.busTypeName,
          maxSeats: bus.maxSeats,
        } : null,
      },
      stats,
    },
    200
  );
};
