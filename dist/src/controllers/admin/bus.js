"use strict";
// src/controllers/admin/busController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusDetails = exports.getBusTypes = exports.getBusStatistics = exports.getBusesByStatus = exports.updateBusStatus = exports.deleteBus = exports.updateBus = exports.createBus = exports.getBusById = exports.getAllBuses = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const BadRequest_1 = require("../../Errors/BadRequest");
const handleImages_1 = require("../../utils/handleImages");
const qrcode_1 = __importDefault(require("qrcode"));
const deleteImage_1 = require("../../utils/deleteImage");
const uuid_1 = require("uuid");
const getAllBuses = async (req, res) => {
    const allBuses = await db_1.db
        .select({
        id: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        status: schema_1.buses.status,
        createdAt: schema_1.buses.createdAt,
        updatedAt: schema_1.buses.updatedAt,
        busType: {
            id: schema_1.busTypes.id,
            name: schema_1.busTypes.name,
            capacity: schema_1.busTypes.capacity,
        },
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id));
    (0, response_1.SuccessResponse)(res, { buses: allBuses }, 200);
};
exports.getAllBuses = getAllBuses;
// ✅ Get Bus By ID
const getBusById = async (req, res) => {
    const { id } = req.params;
    const bus = await db_1.db
        .select({
        id: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        status: schema_1.buses.status,
        createdAt: schema_1.buses.createdAt,
        updatedAt: schema_1.buses.updatedAt,
        busType: {
            id: schema_1.busTypes.id,
            name: schema_1.busTypes.name,
            capacity: schema_1.busTypes.capacity,
            description: schema_1.busTypes.description,
        },
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    if (!bus[0]) {
        throw new NotFound_1.NotFound("Bus not found");
    }
    (0, response_1.SuccessResponse)(res, { bus: bus[0] }, 200);
};
exports.getBusById = getBusById;
const createBus = async (req, res) => {
    const { busTypeId, plateNumber, busNumber, maxSeats, licenseNumber, licenseExpiryDate, licenseImage, busImage, } = req.body;
    // تحقق من وجود الـ Bus Type
    const busType = await db_1.db
        .select()
        .from(schema_1.busTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.busTypes.id, busTypeId))
        .limit(1);
    if (!busType[0]) {
        throw new NotFound_1.NotFound("Bus Type not found");
    }
    // تحقق من عدم تكرار رقم اللوحة
    const existingPlate = await db_1.db
        .select()
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.plateNumber, plateNumber))
        .limit(1);
    if (existingPlate[0]) {
        throw new BadRequest_1.BadRequest("Plate Number already exists");
    }
    // تحقق من عدم تكرار رقم الباص
    const existingBusNumber = await db_1.db
        .select()
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.busNumber, busNumber))
        .limit(1);
    if (existingBusNumber[0]) {
        throw new BadRequest_1.BadRequest("Bus Number already exists");
    }
    // حفظ الصور
    let savedLicenseImage = null;
    let savedBusImage = null;
    let savedQrCodeImage = null;
    if (licenseImage) {
        const result = await (0, handleImages_1.saveBase64Image)(req, licenseImage, "buses/licenses");
        savedLicenseImage = result.url;
    }
    if (busImage) {
        const result = await (0, handleImages_1.saveBase64Image)(req, busImage, "buses/photos");
        savedBusImage = result.url;
    }
    // توليد ID
    const newBusId = (0, uuid_1.v4)();
    // توليد QR Code
    try {
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(newBusId);
        const qrResult = await (0, handleImages_1.saveBase64Image)(req, qrCodeDataUrl, "buses/qrcodes");
        savedQrCodeImage = qrResult.url;
    }
    catch (err) {
        console.error("Failed to generate QR Code for bus", err);
    }
    await db_1.db.insert(schema_1.buses).values({
        id: newBusId,
        busTypeId,
        plateNumber,
        busNumber,
        maxSeats,
        licenseNumber: licenseNumber || null,
        licenseExpiryDate: licenseExpiryDate || null,
        licenseImage: savedLicenseImage,
        busImage: savedBusImage,
        qrCode: savedQrCodeImage,
    });
    // جلب الباص الجديد
    const [createdBus] = await db_1.db
        .select({
        id: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        qrCode: schema_1.buses.qrCode,
        status: schema_1.buses.status,
        createdAt: schema_1.buses.createdAt,
        busType: {
            id: schema_1.busTypes.id,
            name: schema_1.busTypes.name,
            capacity: schema_1.busTypes.capacity,
        },
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, newBusId))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Bus created successfully", bus: createdBus }, 201);
};
exports.createBus = createBus;
// ✅ Update Bus
const updateBus = async (req, res) => {
    const { id } = req.params;
    const { busTypeId, busNumber, plateNumber, maxSeats, licenseNumber, licenseExpiryDate, licenseImage, busImage, status, } = req.body;
    // تحقق من وجود الباص
    const existingBus = await db_1.db
        .select()
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    if (!existingBus[0]) {
        throw new NotFound_1.NotFound("Bus not found");
    }
    const bus = existingBus[0];
    // لو بيغير الـ Bus Type، نتحقق إنه موجود
    if (busTypeId && busTypeId !== bus.busTypeId) {
        const busType = await db_1.db
            .select()
            .from(schema_1.busTypes)
            .where((0, drizzle_orm_1.eq)(schema_1.busTypes.id, busTypeId))
            .limit(1);
        if (!busType[0]) {
            throw new BadRequest_1.BadRequest("Bus Type not found");
        }
    }
    // لو بيغير رقم اللوحة، نتحقق إنه مش مكرر
    if (plateNumber && plateNumber !== bus.plateNumber) {
        const existingPlate = await db_1.db
            .select()
            .from(schema_1.buses)
            .where((0, drizzle_orm_1.eq)(schema_1.buses.plateNumber, plateNumber))
            .limit(1);
        if (existingPlate[0]) {
            throw new BadRequest_1.BadRequest("Plate Number already exists");
        }
    }
    // لو بيغير رقم الباص، نتحقق إنه مش مكرر 
    if (busNumber && busNumber !== bus.busNumber) {
        const existingBusNumber = await db_1.db
            .select()
            .from(schema_1.buses)
            .where((0, drizzle_orm_1.eq)(schema_1.buses.busNumber, busNumber))
            .limit(1);
        if (existingBusNumber[0]) {
            throw new BadRequest_1.BadRequest("Bus Number already exists");
        }
    }
    // Validate status if provided
    if (status && !["active", "inactive", "maintenance"].includes(status)) {
        throw new BadRequest_1.BadRequest("Invalid status. Must be: active, inactive, or maintenance");
    }
    // التعامل مع صورة الرخصة
    let savedLicenseImage = bus.licenseImage;
    if (licenseImage !== undefined) {
        if (licenseImage && typeof licenseImage === "string" && licenseImage.startsWith("data:")) {
            // New base64 image uploaded
            const result = await (0, handleImages_1.saveBase64Image)(req, licenseImage, "buses/licenses");
            // حذف الصورة القديمة بعد حفظ الجديدة بنجاح
            if (bus.licenseImage) {
                await (0, deleteImage_1.deletePhotoFromServer)(bus.licenseImage);
            }
            savedLicenseImage = result.url;
        }
        else if (!licenseImage) {
            // Explicitly set to null/empty → delete old image
            if (bus.licenseImage) {
                await (0, deleteImage_1.deletePhotoFromServer)(bus.licenseImage);
            }
            savedLicenseImage = null;
        }
        // Otherwise it's an existing URL string → keep as-is (no change needed)
    }
    // التعامل مع صورة الباص
    let savedBusImage = bus.busImage;
    if (busImage !== undefined) {
        if (busImage && typeof busImage === "string" && busImage.startsWith("data:")) {
            // New base64 image uploaded
            const result = await (0, handleImages_1.saveBase64Image)(req, busImage, "buses/photos");
            // حذف الصورة القديمة بعد حفظ الجديدة بنجاح
            if (bus.busImage) {
                await (0, deleteImage_1.deletePhotoFromServer)(bus.busImage);
            }
            savedBusImage = result.url;
        }
        else if (!busImage) {
            // Explicitly set to null/empty → delete old image
            if (bus.busImage) {
                await (0, deleteImage_1.deletePhotoFromServer)(bus.busImage);
            }
            savedBusImage = null;
        }
        // Otherwise it's an existing URL string → keep as-is (no change needed)
    }
    await db_1.db
        .update(schema_1.buses)
        .set({
        busTypeId: busTypeId ?? bus.busTypeId,
        busNumber: busNumber ?? bus.busNumber,
        plateNumber: plateNumber ?? bus.plateNumber,
        maxSeats: maxSeats ?? bus.maxSeats,
        licenseNumber: licenseNumber !== undefined ? licenseNumber : bus.licenseNumber,
        licenseExpiryDate: licenseExpiryDate !== undefined
            ? licenseExpiryDate
            : bus.licenseExpiryDate,
        licenseImage: savedLicenseImage,
        busImage: savedBusImage,
        status: status ?? bus.status,
    })
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id));
    // جلب الباص المحدث
    const [updatedBus] = await db_1.db
        .select({
        id: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        status: schema_1.buses.status,
        updatedAt: schema_1.buses.updatedAt,
        busType: {
            id: schema_1.busTypes.id,
            name: schema_1.busTypes.name,
            capacity: schema_1.busTypes.capacity,
        },
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    (0, response_1.SuccessResponse)(res, { message: "Bus updated successfully", bus: updatedBus }, 200);
};
exports.updateBus = updateBus;
// ✅ Delete Bus
const deleteBus = async (req, res) => {
    const { id } = req.params;
    const existingBus = await db_1.db
        .select()
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    if (!existingBus[0]) {
        throw new NotFound_1.NotFound("Bus not found");
    }
    // Check if bus has associated rides - Rides model is currently removed from query
    // حذف الصور من السيرفر
    if (existingBus[0].licenseImage) {
        await (0, deleteImage_1.deletePhotoFromServer)(existingBus[0].licenseImage);
    }
    if (existingBus[0].busImage) {
        await (0, deleteImage_1.deletePhotoFromServer)(existingBus[0].busImage);
    }
    await db_1.db.delete(schema_1.buses).where((0, drizzle_orm_1.eq)(schema_1.buses.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Bus deleted successfully" }, 200);
};
exports.deleteBus = deleteBus;
// ✅ Update Bus Status
const updateBusStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new BadRequest_1.BadRequest("Status is required");
    }
    if (!["active", "inactive", "maintenance"].includes(status)) {
        throw new BadRequest_1.BadRequest("Invalid status. Must be: active, inactive, or maintenance");
    }
    const existingBus = await db_1.db
        .select()
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    if (!existingBus[0]) {
        throw new NotFound_1.NotFound("Bus not found");
    }
    await db_1.db.update(schema_1.buses).set({ status }).where((0, drizzle_orm_1.eq)(schema_1.buses.id, id));
    (0, response_1.SuccessResponse)(res, { message: `Bus status updated to ${status}` }, 200);
};
exports.updateBusStatus = updateBusStatus;
// ✅ Get Buses By Status
const getBusesByStatus = async (req, res) => {
    const { status } = req.params;
    if (!["active", "inactive", "maintenance"].includes(status)) {
        throw new BadRequest_1.BadRequest("Invalid status. Must be: active, inactive, or maintenance");
    }
    const filteredBuses = await db_1.db
        .select({
        id: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        status: schema_1.buses.status,
        busType: {
            id: schema_1.busTypes.id,
            name: schema_1.busTypes.name,
            capacity: schema_1.busTypes.capacity,
        },
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.status, status));
    (0, response_1.SuccessResponse)(res, {
        buses: filteredBuses,
        count: filteredBuses.length,
        status: status,
    }, 200);
};
exports.getBusesByStatus = getBusesByStatus;
// ✅ Get Bus Statistics (جديد)
const getBusStatistics = async (req, res) => {
    // عدد الباصات حسب الحالة
    const allBuses = await db_1.db
        .select({ status: schema_1.buses.status })
        .from(schema_1.buses);
    const stats = {
        total: allBuses.length,
        active: allBuses.filter((b) => b.status === "active").length,
        inactive: allBuses.filter((b) => b.status === "inactive").length,
        maintenance: allBuses.filter((b) => b.status === "maintenance").length,
    };
    (0, response_1.SuccessResponse)(res, {
        statistics: stats,
    }, 200);
};
exports.getBusStatistics = getBusStatistics;
const getBusTypes = async (req, res) => {
    const allBusTypes = await db_1.db.select().from(schema_1.busTypes);
    (0, response_1.SuccessResponse)(res, { busTypes: allBusTypes }, 200);
};
exports.getBusTypes = getBusTypes;
// ✅ 2) GET BUS FULL DETAILS
// ============================================
const getBusDetails = async (req, res) => {
    const { id } = req.params;
    // 1) بيانات الباص الأساسية مع Bus Type
    const [bus] = await db_1.db
        .select({
        id: schema_1.buses.id,
        plateNumber: schema_1.buses.plateNumber,
        busNumber: schema_1.buses.busNumber,
        maxSeats: schema_1.buses.maxSeats,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        licenseImage: schema_1.buses.licenseImage,
        busImage: schema_1.buses.busImage,
        status: schema_1.buses.status,
        createdAt: schema_1.buses.createdAt,
        updatedAt: schema_1.buses.updatedAt,
        // Bus Type
        busTypeId: schema_1.busTypes.id,
        busTypeName: schema_1.busTypes.name,
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.buses.busTypeId, schema_1.busTypes.id))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, id))
        .limit(1);
    if (!bus) {
        throw new NotFound_1.NotFound("Bus not found");
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
    (0, response_1.SuccessResponse)(res, {
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
    }, 200);
};
exports.getBusDetails = getBusDetails;
