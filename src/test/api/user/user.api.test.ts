import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Injector } from "../../../injector";

jest.setTimeout(30000);

describe("User API 통합 테스트", () => {
  let app: any;
  const prisma = new PrismaClient();

  const superAdminData = {
    username: "super_admin_test",
    password: "password123!",
    email: "super_admin@test.com",
    contact: "01012341234",
    name: "Super Admin",
  };
  const adminOf = {
    name: "Test Apartment",
    address: "Test Address",
    description: "Apartment for testing",
    officeNumber: "01011112222",
    buildingNumberFrom: "1",
    buildingNumberTo: "5",
    floorCountPerBuilding: "8",
    unitCountPerFloor: "2",
  };
  const another_adminOf = {
    name: "Another Apartment",
    address: "Another Address",
    description: "Another Apartment for testing",
    officeNumber: "01022223333",
    buildingNumberFrom: "1",
    buildingNumberTo: "3",
    floorCountPerBuilding: "5",
    unitCountPerFloor: "2",
  };
  const adminData = {
    username: "admin_test",
    password: "password123!",
    email: "admin@test.com",
    contact: "01056785678",
    name: "Admin",
    adminOf: adminOf,
  };
  const resident = {
    apartmentId: "하단에서 설정할 예정",
    building: "1",
    unit: "101",
  };
  const residentUserData = {
    username: "resident_test",
    password: "password123!",
    email: "resident@test.com",
    contact: "01087658765",
    name: "Resident",
    resident: resident,
  };
  const newPassword = "newPassword123!";

  beforeAll(async () => {
    const { httpServer } = Injector();
    app = httpServer.app;

    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(async () => {
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  /**
   * 슈퍼 관리자 생성 테스트
   */
  describe("POST /api/v2/users/super-admins", () => {
    test("성공: 유효한 정보로 요청 시 슈퍼 관리자를 생성하고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/super-admins")
        .send(superAdminData);

      expect(res.status).toBe(204);

      const savedUser = await prisma.user.findUnique({
        where: { username: superAdminData.username },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser!.id).toBeDefined();
      expect(savedUser!.username).toBe(superAdminData.username);
      expect(savedUser!.email).toBe(superAdminData.email);
      expect(savedUser!.contact).toBe(superAdminData.contact);
      expect(savedUser!.name).toBe(superAdminData.name);
      expect(savedUser!.role).toBe("SUPER_ADMIN");
      expect(savedUser!.avatar).toBeNull();
      expect(savedUser!.joinStatus).toBe("APPROVED");
      expect(savedUser!.isActive).toBe(true);

      const isPasswordMatch = await bcrypt.compare(
        superAdminData.password,
        savedUser!.password,
      );

      expect(isPasswordMatch).toBe(true);
    });

    test("실패: 이미 존재하는 아이디로 가입 시도 시 상태 코드 400 DUPLICATE_USERNAME 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/super-admins")
        .send({
          ...superAdminData,
          email: "another_email@test.com",
          contact: "01099999999",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("아이디가 중복되었습니다.");
    });

    test("실패: 이미 존재하는 이메일로 가입 시도 시 상태 코드 400 DUPLICATE_EMAIL 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/super-admins")
        .send({
          ...superAdminData,
          username: "another_user",
          contact: "01099999999",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이메일이 중복되었습니다.");
    });

    test("실패: 이미 존재하는 연락처로 가입 시도 시 상태 코드 400 DUPLICATE_CONTACT 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/super-admins")
        .send({
          ...superAdminData,
          username: "another_user_2",
          email: "another_email_2@test.com",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("연락처가 중복되었습니다.");
    });

    test("실패: 필수 정보(비밀번호 등)가 누락되면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/users/super-admins").send({
        username: "incomplete_user",
        email: "incomplete@test.com",
        contact: "01000000000",
        name: "Incomplete",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "Invalid input: expected string, received undefined",
      );
    });
  });

  /**
   * 관리자 생성 테스트
   */
  describe("POST /api/v2/users/admins", () => {
    test("성공: 유효한 정보로 요청 시 관리자와 아파트를 생성하고, 세대 정보를 대량 생성한 뒤 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/admins")
        .send(adminData);

      expect(res.status).toBe(204);

      const savedUser = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser!.id).toBeDefined();
      expect(savedUser!.username).toBe(adminData.username);
      expect(savedUser!.email).toBe(adminData.email);
      expect(savedUser!.contact).toBe(adminData.contact);
      expect(savedUser!.name).toBe(adminData.name);
      expect(savedUser!.role).toBe("ADMIN");
      expect(savedUser!.avatar).toBeNull();
      expect(savedUser!.joinStatus).toBe("PENDING");
      expect(savedUser!.isActive).toBe(false);

      const isPasswordMatch = await bcrypt.compare(
        adminData.password,
        savedUser!.password,
      );

      expect(isPasswordMatch).toBe(true);

      expect(savedUser!.adminOf).not.toBeNull();
      expect(savedUser!.adminOf!.name).toBe(adminOf.name);
      expect(savedUser!.adminOf!.address).toBe(adminOf.address);
      expect(savedUser!.adminOf!.description).toBe(adminOf.description);
      expect(savedUser!.adminOf!.officeNumber).toBe(adminOf.officeNumber);
      expect(savedUser!.adminOf!.buildingNumberFrom).toBe(
        Number(adminOf.buildingNumberFrom),
      );
      expect(savedUser!.adminOf!.buildingNumberTo).toBe(
        Number(adminOf.buildingNumberTo),
      );
      expect(savedUser!.adminOf!.floorCountPerBuilding).toBe(
        Number(adminOf.floorCountPerBuilding),
      );
      expect(savedUser!.adminOf!.unitCountPerFloor).toBe(
        Number(adminOf.unitCountPerFloor),
      );

      const expectedCount =
        Number(adminOf.buildingNumberTo) *
        Number(adminOf.floorCountPerBuilding) *
        Number(adminOf.unitCountPerFloor);

      const householdCount = await prisma.household.count({
        where: { apartmentId: savedUser!.adminOf!.id },
      });

      expect(householdCount).toBe(expectedCount);
    });

    test("성공: 이미 존재하는 아파트이지만 관리자가 없는 경우, 새 아파트를 생성하지 않고 해당 아파트와 연결되어야 한다.", async () => {
      const soloApartment = await prisma.apartment.create({
        data: {
          name: "Solo Apartment",
          address: "Solo Address",
          officeNumber: "027778888",
          description: "Apartment without admin",
          buildingNumberFrom: 1,
          buildingNumberTo: 3,
          floorCountPerBuilding: 5,
          unitCountPerFloor: 2,
        },
      });

      const res = await request(app)
        .post("/api/v2/users/admins")
        .send({
          username: "new_connector_admin",
          password: "password123!",
          email: "connector@test.com",
          contact: "01077778888",
          name: "Connector Admin",
          adminOf: {
            name: soloApartment.name,
            address: soloApartment.address,
            officeNumber: soloApartment.officeNumber,
            description: "설명은 다르지만 기존 아파트와 연결되어야 함",
            buildingNumberFrom: String(soloApartment.buildingNumberFrom),
            buildingNumberTo: String(soloApartment.buildingNumberTo),
            floorCountPerBuilding: String(soloApartment.floorCountPerBuilding),
            unitCountPerFloor: String(soloApartment.unitCountPerFloor),
          },
        });

      expect(res.status).toBe(204);

      const savedAdmin = await prisma.user.findUnique({
        where: { username: "new_connector_admin" },
        include: { adminOf: true },
      });

      expect(savedAdmin).not.toBeNull();
      expect(savedAdmin!.adminOf).not.toBeNull();
      expect(savedAdmin!.adminOf!.id).toBe(soloApartment.id);

      const updatedApartment = await prisma.apartment.findUnique({
        where: { id: soloApartment.id },
      });

      expect(updatedApartment?.adminId).toBe(savedAdmin!.id);
    });

    test("실패: 이미 존재하는 아파트 정보(이름, 주소, 관리사무소 번호 일치)로 가입 시도 시 상태 코드 400 DUPLICATE_APARTMENT 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/admins")
        .send({
          ...adminData,
          username: "other_admin",
          email: "other_admin@test.com",
          contact: "01000001111",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이미 관리자가 존재하는 아파트입니다.");
    });

    test("실패: 이미 존재하는 아이디로 가입 시도 시 상태 코드 400 DUPLICATE_USERNAME 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/admins")
        .send({
          ...adminData,
          email: "another_email@test.com",
          contact: "01099999999",
          adminOf: another_adminOf,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("아이디가 중복되었습니다.");
    });

    test("실패: 이미 존재하는 이메일로 가입 시도 시 상태 코드 400 DUPLICATE_EMAIL 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/admins")
        .send({
          ...adminData,
          username: "another_user",
          contact: "01099999999",
          adminOf: another_adminOf,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이메일이 중복되었습니다.");
    });

    test("실패: 이미 존재하는 연락처로 가입 시도 시 상태 코드 400 DUPLICATE_CONTACT 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/admins")
        .send({
          ...adminData,
          username: "another_user_2",
          email: "another_email_2@test.com",
          adminOf: another_adminOf,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("연락처가 중복되었습니다.");
    });

    test("실패: 필수 정보(이메일 등)가 누락되면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/users/admins").send({
        username: "incomplete_user",
        password: "password123!",
        contact: "01000000000",
        name: "Incomplete",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이메일 형식으로 작성해 주세요.");
    });
  });

  /**
   * 입주민 생성 테스트
   */
  describe("POST /api/v2/users/residents", () => {
    let apartmentId: string;

    beforeAll(async () => {
      const adminUser = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      apartmentId = adminUser!.adminOf!.id;
    });

    test("성공: 유효한 정보로 요청 시 입주민을 생성하고, 올바른 세대(Household)에 연결된 뒤 상태 코드 204를 반환해야 한다.", async () => {
      const residentSignupData = {
        ...residentUserData,
        resident: {
          ...residentUserData.resident,
          apartmentId: apartmentId,
        },
      };

      const res = await request(app)
        .post("/api/v2/users/residents")
        .send(residentSignupData);

      expect(res.status).toBe(204);

      const savedUser = await prisma.user.findUnique({
        where: { username: residentUserData.username },
        include: { resident: { include: { household: true } } },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser!.id).toBeDefined();
      expect(savedUser!.username).toBe(residentUserData.username);
      expect(savedUser!.email).toBe(residentUserData.email);
      expect(savedUser!.contact).toBe(residentUserData.contact);
      expect(savedUser!.name).toBe(residentUserData.name);
      expect(savedUser!.role).toBe("USER");
      expect(savedUser!.avatar).toBeNull();
      expect(savedUser!.joinStatus).toBe("PENDING");
      expect(savedUser!.isActive).toBe(false);

      const isPasswordMatch = await bcrypt.compare(
        residentUserData.password,
        savedUser!.password,
      );

      expect(isPasswordMatch).toBe(true);

      expect(savedUser!.resident).not.toBeNull();
      expect(savedUser!.resident!.household).not.toBeNull();

      expect(savedUser!.resident!.household.apartmentId).toBe(apartmentId);
      expect(savedUser!.resident!.household.building).toBe(
        Number(residentUserData.resident.building),
      );
      expect(savedUser!.resident!.household.unit).toBe(
        Number(residentUserData.resident.unit),
      );
    });

    test("성공: 관리자가 미리 등록한 입주민 정보(이메일)가 존재하면, 가입 즉시 승인(APPROVED) 상태가 되고 계정이 활성화되어야 한다.", async () => {
      const adminUser = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      const targetApartmentId = adminUser!.adminOf!.id;
      const preBuilding = 1;
      const preUnit = 101;

      const preUsername = "pre_approved_user";
      const preEmail = "pre_approved@test.com";
      const preContact = "01000000000";
      const name = "Pre Approved User";

      const household = await prisma.household.findUnique({
        where: {
          apartmentId_building_unit: {
            apartmentId: targetApartmentId,
            building: preBuilding,
            unit: preUnit,
          },
        },
        select: { id: true },
      });

      const preMember = await prisma.householdMember.create({
        data: {
          householdId: household!.id,
          email: preEmail,
          name: name,
          contact: preContact,
        },
      });

      const res = await request(app)
        .post("/api/v2/users/residents")
        .send({
          ...residentUserData,
          username: preUsername,
          contact: preContact,
          email: preEmail,
          resident: {
            apartmentId: targetApartmentId,
            building: String(preBuilding),
            unit: String(preUnit),
          },
        });

      expect(res.status).toBe(204);

      const savedUser = await prisma.user.findUnique({
        where: { username: preUsername },
        include: { resident: { include: { household: true } } },
      });

      expect(savedUser).not.toBeNull();

      expect(savedUser!.resident!.id).toBe(preMember.id);
      expect(savedUser!.resident!.household!.apartmentId).toBe(
        targetApartmentId,
      );
      expect(savedUser!.resident!.household!.building).toBe(
        Number(preBuilding),
      );
      expect(savedUser!.resident!.household!.unit).toBe(Number(preUnit));
      expect(savedUser!.resident!.name).toBe(name);
      expect(savedUser!.resident!.email).toBe(preEmail);
      expect(savedUser!.resident!.contact).toBe(preContact);
      expect(savedUser!.joinStatus).toBe("APPROVED");
      expect(savedUser!.isActive).toBe(true);
    });

    test("실패: 이미 존재하는 아이디로 가입 시도 시 상태 코드 400 DUPLICATE_USERNAME 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/residents")
        .send({
          ...residentUserData,
          email: "another_resident@test.com",
          contact: "01011112222",
          resident: {
            ...residentUserData.resident,
            apartmentId: apartmentId,
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("아이디가 중복되었습니다.");
    });

    test("실패: 이미 존재하는 이메일로 가입 시도 시 상태 코드 400 DUPLICATE_EMAIL 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/residents")
        .send({
          ...residentUserData,
          username: "another_resident_user",
          contact: "01011112222",
          resident: {
            ...residentUserData.resident,
            apartmentId: apartmentId,
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이메일이 중복되었습니다.");
    });

    test("실패: 이미 존재하는 연락처로 가입 시도 시 상태 코드 400 DUPLICATE_CONTACT 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/residents")
        .send({
          ...residentUserData,
          username: "another_resident_user_2",
          email: "another_resident_2@test.com",
          resident: {
            ...residentUserData.resident,
            apartmentId: apartmentId,
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("연락처가 중복되었습니다.");
    });

    test("실패: 필수 정보(아파트ID 등)가 누락되면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .post("/api/v2/users/residents")
        .send({
          ...residentUserData,
          resident: {
            building: "1",
            unit: "101",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "Invalid input: expected string, received undefined",
      );
    });
  });

  /**
   * 관리자 목록 조회 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("GET /api/v2/users/admins", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];

    beforeAll(async () => {
      const loginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = loginRes.headers["set-cookie"] as unknown as string[];
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      await prisma.user.create({
        data: {
          username: "admin_kim",
          password: hashedPassword,
          email: "kim@test.com",
          contact: "01011111111",
          name: "Kim Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Kim Apt",
              address: "Seoul",
              officeNumber: "021111111",
              description: "Kim Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 2,
              unitCountPerFloor: 2,
            },
          },
        },
      });
      await prisma.user.create({
        data: {
          username: "admin_lee",
          password: hashedPassword,
          email: "lee@test.com",
          contact: "01022222222",
          name: "Lee Admin",
          role: "ADMIN",
          joinStatus: "PENDING",
          isActive: false,
          adminOf: {
            create: {
              name: "Lee Apt",
              address: "Busan",
              officeNumber: "022222222",
              description: "Lee Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 2,
              unitCountPerFloor: 2,
            },
          },
        },
      });
      await prisma.user.create({
        data: {
          username: "admin_park",
          password: hashedPassword,
          email: "park@test.com",
          contact: "01033333333",
          name: "Park Admin",
          role: "ADMIN",
          joinStatus: "REJECTED",
          isActive: false,
          adminOf: {
            create: {
              name: "Park Apt",
              address: "Daegu",
              officeNumber: "023333333",
              description: "Park Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 2,
              unitCountPerFloor: 2,
            },
          },
        },
      });

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_kim",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];
    });

    test("성공: 조건 없이 조회 시 기본 설정에 따라 목록을 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/admins")
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const firstItem = res.body.data[0];

      expect(firstItem).toHaveProperty("id");
      expect(firstItem).toHaveProperty("email");
      expect(firstItem).toHaveProperty("name");
      expect(firstItem).toHaveProperty("contact");
      expect(firstItem).toHaveProperty("joinStatus");
      expect(firstItem).toHaveProperty("adminOf");
      expect(firstItem.adminOf).toHaveProperty("name");
    });

    test("성공: 검색어로 이름이나 이메일을 필터링할 수 있어야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/admins")
        .query({ searchKeyword: "Kim" })
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Kim Admin");
    });

    test("성공: 가입 상태 필터링이 작동해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/admins")
        .query({ joinStatus: "APPROVED" })
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);

      const approvedAdmins = res.body.data.filter(
        (admin: any) => admin.email === "kim@test.com",
      );

      expect(approvedAdmins.length).toBe(1);

      const pendingAdmins = res.body.data.filter(
        (admin: any) => admin.email === "lee@test.com",
      );

      expect(pendingAdmins.length).toBe(0);
    });

    test("성공: 페이징(limit, offset)이 작동해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/admins")
        .query({ limit: 1, offset: 0 })
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body).toHaveProperty("totalCount");
      expect(res.body).toHaveProperty("page");
    });

    test("실패: user role이 SUPER_ADMIN이 아닌 경우 상태 코드 401 FORBIDDEN 에러를 던져야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/admins")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 입주민 목록 조회 테스트 (관리자 권한 필요)
   */
  describe("GET /api/v2/users/residents", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let targetApartmentId: string;
    let otherApartmentId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const loginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = loginRes.headers["set-cookie"] as unknown as string[];

      const adminUser = await prisma.user.create({
        data: {
          username: "admin_for_resident_list",
          password: hashedPassword,
          email: "admin_res_list@test.com",
          contact: "01088880000",
          name: "King Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "King Apt for Residents",
              address: "Seoul Gangnam",
              officeNumber: "025555555",
              description: "Resident List Test Apt",
              buildingNumberFrom: 1,
              buildingNumberTo: 5,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
        include: { adminOf: true },
      });
      targetApartmentId = adminUser.adminOf!.id;
      const otherAdminUser = await prisma.user.findUnique({
        where: { username: "admin_kim" },
        include: { adminOf: true },
      });
      otherApartmentId = otherAdminUser!.adminOf!.id;

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_for_resident_list",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const householdId = await prisma.household.create({
        data: {
          apartmentId: targetApartmentId,
          building: 1,
          unit: 101,
        },
      });
      const anotherHouseholdId = await prisma.household.create({
        data: {
          apartmentId: otherApartmentId,
          building: 1,
          unit: 101,
        },
      });

      await prisma.user.create({
        data: {
          username: "user_kim",
          password: hashedPassword,
          email: "user_kim@test.com",
          contact: "01011110000",
          name: "Kim User",
          role: "USER",
          joinStatus: "APPROVED",
          isActive: true,
          resident: {
            create: {
              household: {
                connect: { id: householdId!.id },
              },
              name: "Kim User",
              email: "user_kim@test.com",
              contact: "01011110000",
            },
          },
        },
      });
      await prisma.user.create({
        data: {
          username: "user_lee",
          password: hashedPassword,
          email: "user_lee@test.com",
          contact: "01022220000",
          name: "Lee User",
          role: "USER",
          joinStatus: "PENDING",
          isActive: false,
          resident: {
            create: {
              household: {
                connect: { id: householdId!.id },
              },
              name: "Lee User",
              email: "user_lee@test.com",
              contact: "01022220000",
            },
          },
        },
      });
      await prisma.user.create({
        data: {
          username: "user_hi",
          password: hashedPassword,
          email: "user_hi@test.com",
          contact: "01033330000",
          name: "Hi User",
          role: "USER",
          joinStatus: "REJECTED",
          isActive: false,
          resident: {
            create: {
              household: {
                connect: { id: householdId!.id },
              },
              name: "Hi User",
              email: "user_hi@test.com",
              contact: "01033330000",
            },
          },
        },
      });
      await prisma.user.create({
        data: {
          username: "user_park_other",
          password: hashedPassword,
          email: "user_park@test.com",
          contact: "01044440000",
          name: "Park User",
          role: "USER",
          joinStatus: "APPROVED",
          isActive: true,
          resident: {
            create: {
              household: {
                connect: { id: anotherHouseholdId!.id },
              },
              name: "Park User",
              email: "user_park@test.com",
              contact: "01044440000",
            },
          },
        },
      });
    });

    test("성공: 관리자가 조건 없이 조회 시 모든 입주민 목록을 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/residents")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const firstItem = res.body.data[0];
      expect(firstItem).toHaveProperty("id");
      expect(firstItem).toHaveProperty("email");
      expect(firstItem).toHaveProperty("name");
      expect(firstItem).toHaveProperty("resident");
      expect(firstItem.resident).toHaveProperty("building");
      expect(firstItem.resident).toHaveProperty("unit");
    });

    test("성공: 관리자가 조회 시 '자신이 관리하는 아파트'의 입주민만 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/residents")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);

      const myResidents = res.body.data.filter(
        (u: any) =>
          u.email === "user_kim@test.com" ||
          u.email === "user_lee@test.com" ||
          u.email === "user_hi@test.com",
      );

      expect(myResidents.length).toBeGreaterThanOrEqual(3);

      const otherResidents = res.body.data.filter(
        (u: any) => u.email === "user_park@test.com",
      );

      expect(otherResidents.length).toBe(0);
    });

    test("성공: 검색어로 이름이나 이메일을 필터링할 수 있어야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/residents")
        .query({ searchKeyword: "Kim" })
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Kim User");
    });

    test("성공: 가입 상태 필터링이 작동해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/residents")
        .query({ joinStatus: "PENDING" })
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);

      const pendingUser = res.body.data.find(
        (u: any) => u.email === "user_lee@test.com",
      );

      expect(pendingUser).toBeDefined();

      const approvedUser = res.body.data.find(
        (u: any) => u.email === "user_kim@test.com",
      );

      expect(approvedUser).toBeUndefined();
    });

    test("실패: user role이 ADMIN이 아닌 경우 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/residents")
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 특정 관리자 상세 조회 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("GET /api/v2/users/admins/:adminId", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let targetAdminId: string;
    let savedAdmin: any;

    beforeAll(async () => {
      const superAdminLoginRes = await request(app)
        .post("/api/v2/auth/login")
        .send({
          username: superAdminData.username,
          password: superAdminData.password,
        });
      superAdminCookies = superAdminLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_for_resident_list",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      savedAdmin = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      targetAdminId = savedAdmin!.id;
    });

    test("성공: 슈퍼 관리자가 특정 관리자의 상세 정보를 조회하면 상태 코드 200 OK와 올바른 데이터를 반환해야 한다.", async () => {
      const res = await request(app)
        .get(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", savedAdmin!.name);
      expect(res.body).toHaveProperty("email", savedAdmin!.email);
      expect(res.body).toHaveProperty("contact", savedAdmin!.contact);
      expect(res.body).toHaveProperty("adminOf");
      expect(res.body.adminOf).toHaveProperty(
        "name",
        savedAdmin!.adminOf!.name,
      );
      expect(res.body.adminOf).toHaveProperty(
        "address",
        savedAdmin!.adminOf!.address,
      );
      expect(res.body.adminOf).toHaveProperty(
        "officeNumber",
        savedAdmin!.adminOf!.officeNumber,
      );
      expect(res.body.adminOf).toHaveProperty(
        "description",
        savedAdmin!.adminOf!.description,
      );
    });

    test("실패: 존재하지 않는 관리자 ID로 조회 시 상태 코드 404 USER_NOT_FOUND 에러를 반환해야 한다.", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .get(`/api/v2/users/admins/${nonExistentId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(
        "해당되는 유저를 찾을 수 없습니다. 다시 확인해 주세요.",
      );
    });

    test("실패: user role이 SUPER_ADMIN이 아닌 경우 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .get(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", adminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 본인 프로필 조회 테스트 (관리자 및 입주민)
   */
  describe("GET /api/v2/users/me", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let userCookies: string[];
    let adminInfo: any;
    let userInfo: any;

    beforeAll(async () => {
      const superAdminLoginRes = await request(app)
        .post("/api/v2/auth/login")
        .send({
          username: superAdminData.username,
          password: superAdminData.password,
        });
      superAdminCookies = superAdminLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_for_resident_list",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];
      adminInfo = await prisma.user.findUnique({
        where: { username: "admin_for_resident_list" },
        include: { adminOf: true },
      });

      const residentUserLoginRes = await request(app)
        .post("/api/v2/auth/login")
        .send({
          username: "user_kim",
          password: residentUserData.password,
        });
      userInfo = await prisma.user.findUnique({
        where: { username: "user_kim" },
        include: { resident: { include: { household: true } } },
      });
      userCookies = residentUserLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
    });

    test("성공: 관리자가 본인의 프로필을 조회하면 상태 코드 200 OK와 자신의 정보를 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/me")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty("username", adminInfo.username);
      expect(res.body).toHaveProperty("contact", adminInfo.contact);
      expect(res.body).toHaveProperty("name", adminInfo.name);
      expect(res.body).toHaveProperty("email", adminInfo.email);
    });

    test("성공: 입주민이 본인의 프로필을 조회하면 상태 코드 200 OK와 자신의 정보를 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/me")
        .set("Cookie", userCookies);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty("username", userInfo.username);
      expect(res.body).toHaveProperty("contact", userInfo.contact);
      expect(res.body).toHaveProperty("name", userInfo.name);
      expect(res.body).toHaveProperty("email", userInfo.email);
    });

    test("실패: 슈퍼 관리자가 프로필 조회를 시도하면 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .get("/api/v2/users/me")
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 로그인하지 않은 상태로 조회 시 상태 코드 401 UNAUTHORIZED_REQUEST 에러를 반환해야 한다.", async () => {
      const res = await request(app).get("/api/v2/users/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한이 없어요.");
    });
  });

  /**
   * 관리자 개별 가입 상태 변경 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("PATCH /api/v2/users/admins/:adminId/join-status", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let pendingAdminId: string;
    let pendingAdmin2Id: string;
    let approvedAdminId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_for_resident_list",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const pendingAdmin = await prisma.user.findUnique({
        where: { username: adminData.username },
      });
      pendingAdminId = pendingAdmin!.id;

      const pendingAdmin2 = await prisma.user.create({
        data: {
          username: "pending_admin_test",
          password: hashedPassword,
          email: "pending_admin@test.com",
          contact: "01088887777",
          name: "Pending Admin",
          role: "ADMIN",
          joinStatus: "PENDING",
          isActive: false,
          adminOf: {
            create: {
              name: "Pending Apt",
              address: "Pending City",
              officeNumber: "027878777",
              description: "Pending Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
      });
      pendingAdmin2Id = pendingAdmin2.id;

      const approvedAdmin = await prisma.user.create({
        data: {
          username: "approved_admin_test",
          password: hashedPassword,
          email: "approved_admin@test.com",
          contact: "01054545454",
          name: "Approved Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Approved Apt",
              address: "Approved City",
              officeNumber: "021597538",
              description: "Approved Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
      });
      approvedAdminId = approvedAdmin.id;
    });

    test("성공: 슈퍼 관리자가 PENDING 상태인 관리자를 승인하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${pendingAdminId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: pendingAdminId },
      });
      expect(updatedAdmin?.joinStatus).toBe("APPROVED");
      expect(updatedAdmin?.isActive).toBe(true);
    });

    test("성공: 슈퍼 관리자가 PENDING 상태인 관리자를 거절하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${pendingAdmin2Id}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "REJECTED" });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: pendingAdmin2Id },
      });
      expect(updatedAdmin?.joinStatus).toBe("REJECTED");
      expect(updatedAdmin?.isActive).toBe(false);
    });

    test("성공: 슈퍼 관리자가 관리자를 거절하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${approvedAdminId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "REJECTED" });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: approvedAdminId },
      });
      expect(updatedAdmin?.joinStatus).toBe("REJECTED");
      expect(updatedAdmin?.isActive).toBe(false);
    });

    test("성공: 슈퍼 관리자가 관리자를 승인하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${approvedAdminId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: approvedAdminId },
      });
      expect(updatedAdmin?.joinStatus).toBe("APPROVED");
      expect(updatedAdmin?.isActive).toBe(true);
    });

    test("실패: 유효하지 않은 joinStatus를 보내면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${pendingAdminId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "PENDING" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
      );
    });

    test("실패: 슈퍼 관리자가 아닌 계정이 요청 시 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${pendingAdmin2Id}/join-status`)
        .set("Cookie", adminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 존재하지 않는 관리자 ID로 요청 시 상태 코드 404 USER_NOT_FOUND 에러를 반환해야 한다.", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .patch(`/api/v2/users/admins/${nonExistentId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(
        "해당되는 유저를 찾을 수 없습니다. 다시 확인해 주세요.",
      );
    });
  });

  /**
   * 관리자 일괄 가입 상태 변경 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("PATCH /api/v2/users/admins/join-status", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];

    beforeAll(async () => {
      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: "admin_for_resident_list",
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];
    });

    const createPendingAdmin = async (
      username: string,
      email: string,
      contact: string,
    ) => {
      const hashedPassword = await bcrypt.hash("password123!", 10);
      return prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          contact,
          name: `Pending Batch Admin ${username}`,
          role: "ADMIN",
          joinStatus: "PENDING",
          isActive: false,
          adminOf: {
            create: {
              name: `Apt for ${username}`,
              address: `Batch City ${username}`,
              officeNumber: String(Number(contact) - 1),
              description: `Batch Test ${username}`,
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
      });
    };

    test("성공: 슈퍼 관리자가 일괄 승인을 요청하면, 모든 PENDING 상태의 관리자가 승인 및 활성화되어야 한다.", async () => {
      await createPendingAdmin(
        "batch_approve_1",
        "approve1@test.com",
        "01011119999",
      );
      await createPendingAdmin(
        "batch_approve_2",
        "approve2@test.com",
        "01022229999",
      );

      const res = await request(app)
        .patch("/api/v2/users/admins/join-status")
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(204);

      const approvedAdmins = await prisma.user.findMany({
        where: {
          username: { in: ["batch_approve_1", "batch_approve_2"] },
        },
      });

      expect(approvedAdmins.length).toBe(2);
      approvedAdmins.forEach((admin) => {
        expect(admin.joinStatus).toBe("APPROVED");
        expect(admin.isActive).toBe(true);
      });
    });

    test("성공: 슈퍼 관리자가 일괄 거절을 요청하면, 모든 PENDING 상태의 관리자가 거절 및 비활성화되어야 한다.", async () => {
      await createPendingAdmin(
        "batch_reject_1",
        "reject1@test.com",
        "01033339999",
      );
      await createPendingAdmin(
        "batch_reject_2",
        "reject2@test.com",
        "01044449999",
      );

      const res = await request(app)
        .patch("/api/v2/users/admins/join-status")
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "REJECTED" });

      expect(res.status).toBe(204);

      const rejectedAdmins = await prisma.user.findMany({
        where: {
          username: { in: ["batch_reject_1", "batch_reject_2"] },
        },
      });

      expect(rejectedAdmins.length).toBe(2);
      rejectedAdmins.forEach((admin) => {
        expect(admin.joinStatus).toBe("REJECTED");
        expect(admin.isActive).toBe(false);
      });
    });

    test("실패: 유효하지 않은 joinStatus를 보내면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/admins/join-status")
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "PENDING" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
      );
    });

    test("실패: 슈퍼 관리자가 아닌 계정이 요청 시 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/admins/join-status")
        .set("Cookie", adminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 입주민 개별 가입 상태 변경 테스트 (관리자 권한 필요)
   */
  describe("PATCH /api/v2/users/residents/:residentId/join-status", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let residentUser: any;
    let pendingUser: any;
    let pendingUserId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const myAdmin = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      const myApartmentId = myAdmin!.adminOf!.id;

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      residentUser = await prisma.user.findUnique({
        where: { username: residentUserData.username },
        include: { resident: { include: { household: true } } },
      });

      const myHousehold = await prisma.household.findUnique({
        where: {
          apartmentId_building_unit: {
            apartmentId: myApartmentId,
            building: 1,
            unit: 101,
          },
        },
      });

      pendingUser = await prisma.user.create({
        data: {
          username: "pending_resident",
          password: hashedPassword,
          email: "pending_res@test.com",
          contact: "01022228888",
          name: "Pending Res",
          role: "USER",
          joinStatus: "PENDING",
          isActive: false,
          resident: {
            create: {
              household: { connect: { id: myHousehold!.id } },
              name: "Pending Res",
              email: "pending_res@test.com",
              contact: "01022228888",
            },
          },
        },
        include: { resident: { include: { household: true } } },
      });
      pendingUserId = pendingUser.id;
    });

    test("성공: 관리자가 자신의 아파트에 신청한 입주민을 승인하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/residents/${residentUser.id}/join-status`)
        .set("Cookie", adminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(204);

      const updatedUser = await prisma.user.findUnique({
        where: { id: residentUser.id },
      });
      expect(updatedUser?.joinStatus).toBe("APPROVED");
      expect(updatedUser?.isActive).toBe(true);
    });

    test("성공: 관리자가 자신의 아파트에 신청한 입주민을 거절하면 상태가 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/residents/${pendingUserId}/join-status`)
        .set("Cookie", adminCookies)
        .send({ joinStatus: "REJECTED" });

      expect(res.status).toBe(204);

      const updatedUser = await prisma.user.findUnique({
        where: { id: pendingUserId },
      });
      expect(updatedUser?.joinStatus).toBe("REJECTED");
      expect(updatedUser?.isActive).toBe(false);
    });

    test("실패: 유효하지 않은 joinStatus를 보내면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/residents/${pendingUserId}/join-status`)
        .set("Cookie", adminCookies)
        .send({ joinStatus: "PENDING" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
      );
    });

    test("실패: 관리자가 아닌 계정이 요청 시 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/residents/${pendingUserId}/join-status`)
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 존재하지 않는 유저 ID로 요청 시 상태 코드 404 USER_NOT_FOUND 에러를 반환해야 한다.", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .patch(`/api/v2/users/residents/${nonExistentId}/join-status`)
        .set("Cookie", adminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(
        "해당되는 유저를 찾을 수 없습니다. 다시 확인해 주세요.",
      );
    });
  });

  /**
   * 입주민 일괄 가입 상태 변경 테스트 (관리자 권한 필요)
   */
  describe("PATCH /api/v2/users/residents/join-status", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let userCookies: string[];
    let myApartmentId: string;
    let otherApartmentId: string;
    let myHouseholdId: string;
    let otherHouseholdId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const myAdmin = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      myApartmentId = myAdmin!.adminOf!.id;

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];
      const userLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: residentUserData.username,
        password: residentUserData.password,
      });
      userCookies = userLoginRes.headers["set-cookie"] as unknown as string[];

      const otherAdmin = await prisma.user.create({
        data: {
          username: "other_batch_admin",
          password: hashedPassword,
          email: "other_batch@test.com",
          contact: "01087654321",
          name: "Other Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Other Apt",
              address: "Other City",
              officeNumber: "023334444",
              description: "Other Test",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      otherApartmentId = otherAdmin.adminOf!.id;

      const myHousehold = await prisma.household.findUnique({
        where: {
          apartmentId_building_unit: {
            apartmentId: myApartmentId,
            building: 1,
            unit: 101,
          },
        },
      });
      myHouseholdId = myHousehold!.id;
      const otherHousehold = await prisma.household.create({
        data: { apartmentId: otherApartmentId, building: 1, unit: 101 },
      });
      otherHouseholdId = otherHousehold.id;
    });

    const createPendingResident = async (
      username: string,
      email: string,
      contact: string,
      householdId: string,
    ) => {
      const hashedPassword = await bcrypt.hash("password123!", 10);
      return prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          contact,
          name: `Pending Batch user ${username}`,
          role: "USER",
          joinStatus: "PENDING",
          isActive: false,
          resident: {
            create: {
              name: `For test ${username}`,
              contact,
              email,
              household: { connect: { id: householdId } },
            },
          },
        },
      });
    };

    test("성공: 관리자가 일괄 승인을 요청하면, '자신의 아파트' PENDING 입주민만 모두 승인되어야 한다.", async () => {
      await createPendingResident(
        "approve_1",
        "approveUser1@test.com",
        "01012341111",
        myHouseholdId,
      );
      await createPendingResident(
        "approve_2",
        "approveUser2@test.com",
        "01012342222",
        myHouseholdId,
      );
      await createPendingResident(
        "approve_3",
        "approveUser3@test.com",
        "01012343333",
        otherHouseholdId,
      );

      const res = await request(app)
        .patch("/api/v2/users/residents/join-status")
        .set("Cookie", adminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(204);

      const myResidents = await prisma.user.findMany({
        where: {
          email: { in: ["approveUser1@test.com", "approveUser2@test.com"] },
        },
      });

      expect(myResidents.length).toBe(2);
      myResidents.forEach((user) => {
        expect(user.joinStatus).toBe("APPROVED");
        expect(user.isActive).toBe(true);
      });

      const otherResident = await prisma.user.findUnique({
        where: { email: "approveUser3@test.com" },
      });

      expect(otherResident!.joinStatus).toBe("PENDING");
      expect(otherResident!.isActive).toBe(false);
    });

    test("성공: 관리자가 일괄 거절을 요청하면, '자신의 아파트' PENDING 입주민만 모두 거절되어야 한다.", async () => {
      await createPendingResident(
        "approve_4",
        "approveUser4@test.com",
        "01012344444",
        myHouseholdId,
      );
      await createPendingResident(
        "approve_5",
        "approveUser5@test.com",
        "01012345555",
        myHouseholdId,
      );
      await createPendingResident(
        "approve_6",
        "approveUser6@test.com",
        "01012346666",
        otherHouseholdId,
      );

      const res = await request(app)
        .patch("/api/v2/users/residents/join-status")
        .set("Cookie", adminCookies)
        .send({ joinStatus: "REJECTED" });

      expect(res.status).toBe(204);

      const rejectedUsers = await prisma.user.findMany({
        where: {
          email: { in: ["approveUser4@test.com", "approveUser5@test.com"] },
        },
      });

      expect(rejectedUsers.length).toBe(2);
      rejectedUsers.forEach((user) => {
        expect(user.joinStatus).toBe("REJECTED");
        expect(user.isActive).toBe(false);
      });

      const otherResidents = await prisma.user.findMany({
        where: {
          email: { in: ["approveUser3@test.com", "approveUser6@test.com"] },
        },
      });

      expect(otherResidents.length).toBe(2);
      otherResidents.forEach((user) => {
        expect(user.joinStatus).toBe("PENDING");
        expect(user.isActive).toBe(false);
      });
    });

    test("실패: 유효하지 않은 joinStatus를 보내면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/residents/join-status")
        .set("Cookie", adminCookies)
        .send({ joinStatus: "PENDING" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "가입 승인 상태는 APPROVED(승인) 또는 REJECTED(거절)만 가능합니다.",
      );
    });

    test("실패: 슈퍼 관리자가 요청 시 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/residents/join-status")
        .set("Cookie", superAdminCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 일반 입주민이 요청 시 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/residents/join-status")
        .set("Cookie", userCookies)
        .send({ joinStatus: "APPROVED" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 본인 프로필 사진 수정 테스트 (관리자 및 입주민)
   */
  describe("PATCH /api/v2/users/me/avatar", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let userCookies: string[];
    let adminId: string;
    let userId: string;

    beforeAll(async () => {
      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const admin = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      adminId = admin!.id;
      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const user = await prisma.user.findUnique({
        where: { username: residentUserData.username },
      });
      userId = user!.id;
      const userLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: residentUserData.username,
        password: residentUserData.password,
      });
      userCookies = userLoginRes.headers["set-cookie"] as unknown as string[];
    });

    test("성공: 관리자가 프로필 사진을 업로드하면 DB에 아바타 정보가 업데이트되고 상태 코드 204 OK를 반환해야 한다.", async () => {
      const fileBuffer = Buffer.from("fake_image_content");

      const res = await request(app)
        .patch("/api/v2/users/me/avatar")
        .set("Cookie", adminCookies)
        .attach("avatarImage", fileBuffer, "admin_profile.jpg");

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: adminId },
      });
      expect(updatedAdmin!.avatar).not.toBeNull();
      // 만약 로컬/S3 업로드 로직이 실제 동작한다면 URL 형태인지 체크
      // expect(updatedAdmin?.avatar).toMatch(/^https?:\/\//);
    });

    test("성공: 입주민이 프로필 사진을 업로드하면 DB에 아바타 정보가 업데이트되고 상태 코드 204 OK를 반환해야 한다.", async () => {
      const fileBuffer = Buffer.from("user_image_content");

      const res = await request(app)
        .patch("/api/v2/users/me/avatar")
        .set("Cookie", userCookies)
        .attach("avatarImage", fileBuffer, "user_profile.png");

      expect(res.status).toBe(204);

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(updatedUser!.avatar).not.toBeNull();
    });

    test("실패: 슈퍼 관리자가 아바타 수정을 시도하면 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const fileBuffer = Buffer.from("super_image_content");

      const res = await request(app)
        .patch("/api/v2/users/me/avatar")
        .set("Cookie", superAdminCookies)
        .attach("avatarImage", fileBuffer, "super_profile.jpg");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 파일을 첨부하지 않고 요청하면 상태 코드 400 IMAGE_NOT_FOUND 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/avatar")
        .set("Cookie", userCookies)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "이미지 파일을 찾을 수 없습니다. 다시 업로드해주세요.",
      );
    });
  });

  /**
   * 본인 비밀번호 변경 테스트 (관리자 및 입주민)
   */
  describe("PATCH /api/v2/users/me/password", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let userCookies: string[];
    let adminId: string;
    let userId: string;

    beforeAll(async () => {
      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: adminData.password,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const adminUser = await prisma.user.findUnique({
        where: { username: adminData.username },
      });
      adminId = adminUser!.id;

      const userLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: residentUserData.username,
        password: residentUserData.password,
      });
      userCookies = userLoginRes.headers["set-cookie"] as unknown as string[];

      const residentUser = await prisma.user.findUnique({
        where: { username: residentUserData.username },
      });
      userId = residentUser!.id;
    });

    test("성공: 관리자가 현재 비밀번호를 올바르게 입력하면 새 비밀번호로 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/password")
        .set("Cookie", adminCookies)
        .send({
          password: adminData.password,
          newPassword: newPassword,
        });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: adminId },
      });
      const isMatch = await bcrypt.compare(newPassword, updatedAdmin!.password);

      expect(isMatch).toBe(true);
    });

    test("성공: 입주민이 현재 비밀번호를 올바르게 입력하면 새 비밀번호로 변경되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/password")
        .set("Cookie", userCookies)
        .send({
          password: residentUserData.password,
          newPassword: newPassword,
        });

      expect(res.status).toBe(204);

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      const isMatch = await bcrypt.compare(newPassword, updatedUser!.password);

      expect(isMatch).toBe(true);
    });

    test("실패: 관리자가 비밀번호를 변경한 다음 이전 비밀번호로 재로그인을 시도하면 상태 코드 401 INVALID_AUTH 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: adminData.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "이메일 또는 비밀번호가 일치하지 않아요.",
      );
    });

    test("실패: 입주민이 비밀번호를 변경한 다음 이전 비밀번호로 재로그인을 시도하면 상태 코드 401 INVALID_AUTH 에러를 반환해야 한다.", async () => {
      const res = await request(app).post("/api/v2/auth/login").send({
        username: residentUserData.username,
        password: residentUserData.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "이메일 또는 비밀번호가 일치하지 않아요.",
      );
    });

    test("실패: 현재 비밀번호가 일치하지 않으면 상태 코드 400 INVALID_PASSWORD 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/password")
        .set("Cookie", adminCookies)
        .send({
          password: "wrong_password!1",
          newPassword: "any_new_password!1",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("비밀번호가 일치하지 않습니다.");
    });

    test("실패: 슈퍼 관리자가 비밀번호 변경을 시도하면 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/password")
        .set("Cookie", superAdminCookies)
        .send({
          password: superAdminData.password,
          newPassword: newPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 필수 정보(새 비밀번호 등)가 누락되면 상태 코드 400 zod 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch("/api/v2/users/me/password")
        .set("Cookie", userCookies)
        .send({
          password: residentUserData.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        "Invalid input: expected string, received undefined",
      );
    });
  });

  /**
   * 관리자 정보 수정 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("PATCH /api/v2/users/admins/:adminId", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let targetAdminId: string;
    let otherAdminId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: newPassword,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const targetAdmin = await prisma.user.create({
        data: {
          username: "edit_target_admin",
          password: hashedPassword,
          email: "target_edit@test.com",
          contact: "01055556666",
          name: "Original Target",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Original Apt",
              address: "Original City",
              officeNumber: "025556666",
              description: "Original Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
        include: { adminOf: true },
      });
      targetAdminId = targetAdmin.id;

      const otherAdmin = await prisma.user.create({
        data: {
          username: "other_existing_admin",
          password: hashedPassword,
          email: "other_existing@test.com",
          contact: "01099998888",
          name: "Other Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Existing Apt",
              address: "Existing City",
              officeNumber: "029998888",
              description: "Existing Desc",
              buildingNumberFrom: 1,
              buildingNumberTo: 2,
              floorCountPerBuilding: 5,
              unitCountPerFloor: 2,
            },
          },
        },
        include: { adminOf: true },
      });
      otherAdminId = otherAdmin.id;
    });

    test("성공: 슈퍼 관리자가 관리자의 기본 정보(이름, 이메일, 연락처 등)를 수정하면 DB에 반영되고 상태 코드 204를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", superAdminCookies)
        .send({
          name: "Updated Name",
          email: "updated_email@naver.com",
          contact: "01008088888",
        });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: targetAdminId },
      });
      expect(updatedAdmin!.name).toBe("Updated Name");
      expect(updatedAdmin!.email).toBe("updated_email@naver.com");
      expect(updatedAdmin!.contact).toBe("01008088888");
    });

    test("성공: 이미 존재하는 다른 아파트 정보(이름, 주소, 번호 등)로 수정을 시도하지만, 해당 아파트의 관리자가 수정하는 관리자와 동일하다면 정상적으로 수정된다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", superAdminCookies)
        .send({
          adminOf: {
            name: "Original Apt",
            address: "Original City",
            officeNumber: "025556666",
            description: "Try Duplicate Same Admin",
          },
        });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: targetAdminId },
        include: { adminOf: true },
      });

      expect(updatedAdmin!.adminOf!.name).toBe("Original Apt");
      expect(updatedAdmin!.adminOf!.address).toBe("Original City");
      expect(updatedAdmin!.adminOf!.officeNumber).toBe("025556666");
      expect(updatedAdmin!.adminOf!.description).toBe(
        "Try Duplicate Same Admin",
      );
    });

    test("성공: 슈퍼 관리자가 관리자의 아파트 정보를 수정하면 DB에 반영되어야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", superAdminCookies)
        .send({
          adminOf: {
            name: "New Apt Name",
            address: "New City",
            officeNumber: "021231234",
            description: "New Description",
          },
        });

      expect(res.status).toBe(204);

      const updatedAdmin = await prisma.user.findUnique({
        where: { id: targetAdminId },
        include: { adminOf: true },
      });

      expect(updatedAdmin!.adminOf!.name).toBe("New Apt Name");
      expect(updatedAdmin!.adminOf!.address).toBe("New City");
      expect(updatedAdmin!.adminOf!.officeNumber).toBe("021231234");
      expect(updatedAdmin!.adminOf!.description).toBe("New Description");
    });

    test("실패: 이미 존재하는 다른 아파트 정보(이름, 주소, 번호 등)로 수정을 시도하면 상태 코드 400 DUPLICATE_APARTMENT 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", superAdminCookies)
        .send({
          adminOf: {
            name: "Existing Apt",
            address: "Existing City",
            officeNumber: "029998888",
            description: "Try Duplicate",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("이미 관리자가 존재하는 아파트입니다.");
    });

    test("실패: 슈퍼 관리자가 아닌 계정이 수정을 시도하면 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${targetAdminId}`)
        .set("Cookie", adminCookies)
        .send({ name: "Hacker Name" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 존재하지 않는 관리자 ID로 수정 요청 시 상태 코드 404 USER_NOT_FOUND 에러를 반환해야 한다.", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .patch(`/api/v2/users/admins/${nonExistentId}`)
        .set("Cookie", superAdminCookies)
        .send({ name: "Ghost Admin" });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(
        "해당되는 유저를 찾을 수 없습니다. 다시 확인해 주세요.",
      );
    });
  });

  /**
   * 관리자 개별 삭제 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("DELETE /api/v2/users/admins/:adminId", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let approvedAdminId: string;
    let approvedApartmentId: string;
    let pendingAdminId: string;
    let pendingApartmentId: string;
    let rejectedAdminId: string;
    let rejectedApartmentId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: newPassword,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const approvedAdmin = await prisma.user.create({
        data: {
          username: "delete_approved",
          password: hashedPassword,
          email: "del_app@naver.com",
          contact: "01048627593",
          name: "Delete Approved",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Approved Delete TEST Apt",
              address: "Del TEST City 1",
              officeNumber: "021019889",
              description: "Should Remain",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      approvedAdminId = approvedAdmin.id;
      approvedApartmentId = approvedAdmin.adminOf!.id;

      await prisma.household.create({
        data: { apartmentId: approvedApartmentId, building: 1, unit: 101 },
      });

      const pendingAdmin = await prisma.user.create({
        data: {
          username: "delete_pending",
          password: hashedPassword,
          email: "del_pending@naver.com",
          contact: "01048627597",
          name: "Delete Pending",
          role: "ADMIN",
          joinStatus: "PENDING",
          isActive: false,
          adminOf: {
            create: {
              name: "Pending Delete TEST Apt",
              address: "Del TEST City 2",
              officeNumber: "021019887",
              description: "Should Remain",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      pendingAdminId = pendingAdmin.id;
      pendingApartmentId = pendingAdmin.adminOf!.id;

      await prisma.household.create({
        data: { apartmentId: pendingApartmentId, building: 1, unit: 101 },
      });

      const rejectedAdmin = await prisma.user.create({
        data: {
          username: "delete_rejected",
          password: hashedPassword,
          email: "del_rej@naver.com",
          contact: "01028029089",
          name: "Delete Rejected",
          role: "ADMIN",
          joinStatus: "REJECTED",
          isActive: false,
          adminOf: {
            create: {
              name: "Rejected Delete TEST Apt",
              address: "Del TEST City 3",
              officeNumber: "022029889",
              description: "Should be Deleted",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      rejectedAdminId = rejectedAdmin.id;
      rejectedApartmentId = rejectedAdmin.adminOf!.id;

      await prisma.household.create({
        data: { apartmentId: rejectedApartmentId, building: 1, unit: 101 },
      });
    });

    test("성공: 슈퍼 관리자가 '활동이 승인된(APPROVED)' 관리자를 삭제하면, 관리자 정보는 삭제되지만 아파트와 세대 정보는 유지되어야 한다.", async () => {
      const res = await request(app)
        .delete(`/api/v2/users/admins/${approvedAdminId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(204);

      const deletedUser = await prisma.user.findUnique({
        where: { id: approvedAdminId },
      });

      expect(deletedUser).toBeNull();

      const apartment = await prisma.apartment.findUnique({
        where: { id: approvedApartmentId },
      });

      expect(apartment).not.toBeNull();
      expect(apartment!.adminId).toBeNull();

      const householdCount = await prisma.household.count({
        where: { apartmentId: approvedApartmentId },
      });

      expect(householdCount).toBe(1);
    });

    test("성공: 슈퍼 관리자가 '활동 대기중인(PENDING)' 관리자를 삭제하면, 관리자 정보는 삭제되지만 아파트와 세대 정보는 유지되어야 한다.", async () => {
      const res = await request(app)
        .delete(`/api/v2/users/admins/${pendingAdminId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(204);

      const deletedUser = await prisma.user.findUnique({
        where: { id: pendingAdminId },
      });

      expect(deletedUser).toBeNull();

      const apartment = await prisma.apartment.findUnique({
        where: { id: pendingApartmentId },
      });

      expect(apartment).not.toBeNull();
      expect(apartment!.adminId).toBeNull();

      const householdCount = await prisma.household.count({
        where: { apartmentId: pendingApartmentId },
      });

      expect(householdCount).toBe(1);
    });

    test("성공: 슈퍼 관리자가 '활동이 거절된(REJECTED)' 관리자를 삭제하면, 관리자 정보는 삭제되지만 아파트와 세대 정보는 유지되어야 한다.", async () => {
      const res = await request(app)
        .delete(`/api/v2/users/admins/${rejectedAdminId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(204);

      const deletedUser = await prisma.user.findUnique({
        where: { id: rejectedAdminId },
      });

      expect(deletedUser).toBeNull();

      const apartment = await prisma.apartment.findUnique({
        where: { id: rejectedApartmentId },
      });

      expect(apartment).not.toBeNull();
      expect(apartment!.adminId).toBeNull();

      const householdCount = await prisma.household.count({
        where: { apartmentId: rejectedApartmentId },
      });

      expect(householdCount).toBe(1);
    });

    test("실패: 슈퍼 관리자가 아닌 계정이 삭제를 시도하면 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const randomId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .delete(`/api/v2/users/admins/${randomId}`)
        .set("Cookie", adminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("멱등성 보장 성공: 존재하지 않는 관리자 ID 이더라도, 삭제 요청은 에러를 반환하지 않는다.", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .delete(`/api/v2/users/admins/${nonExistentId}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(204);
    });
  });

  /**
   * 관리자 일괄 삭제 테스트 (슈퍼 관리자 권한 필요)
   */
  describe("DELETE /api/v2/users/admins/rejected", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let rejectedAdminId1: string;
    let rejectedApartmentId1: string;
    let rejectedAdminId2: string;
    let rejectedApartmentId2: string;
    let approvedAdminId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: newPassword,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const rejected1 = await prisma.user.create({
        data: {
          username: "batch_rej_1_for_test",
          password: hashedPassword,
          email: "batch_rej_1@naver.com",
          contact: "01011110079",
          name: "Batch Reject 1",
          role: "ADMIN",
          joinStatus: "REJECTED",
          isActive: false,
          adminOf: {
            create: {
              name: "Batch Rej TEST Apt 1",
              address: "Rej TEST City 1",
              officeNumber: "021110079",
              description: "Must be Deleted",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      rejectedAdminId1 = rejected1.id;
      rejectedApartmentId1 = rejected1.adminOf!.id;
      await prisma.household.create({
        data: { apartmentId: rejectedApartmentId1, building: 1, unit: 101 },
      });

      const rejected2 = await prisma.user.create({
        data: {
          username: "batch_rej_2_for_test",
          password: hashedPassword,
          email: "batch_rej_2@naver.com",
          contact: "01011110097",
          name: "Batch Reject 2",
          role: "ADMIN",
          joinStatus: "REJECTED",
          isActive: false,
          adminOf: {
            create: {
              name: "Batch Rej TEST Apt 2",
              address: "Rej TEST City 2",
              officeNumber: "021110097",
              description: "Must be Deleted too",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      rejectedAdminId2 = rejected2.id;
      rejectedApartmentId2 = rejected2.adminOf!.id;
      await prisma.household.create({
        data: { apartmentId: rejectedApartmentId2, building: 1, unit: 101 },
      });

      const approved = await prisma.user.create({
        data: {
          username: "batch_app_safe_for_test",
          password: hashedPassword,
          email: "batch_safe@naver.com",
          contact: "01011110058",
          name: "Batch Safe",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Safe Apt",
              address: "Safe City",
              officeNumber: "021110058",
              description: "Should NOT be Deleted",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      approvedAdminId = approved.id;
    });

    test("성공: 슈퍼 관리자가 일괄 삭제를 요청하면, 모든 REJECTED 상태의 관리자와 연관된 아파트, 세대 정보가 모두 삭제되어야 한다.", async () => {
      const res = await request(app)
        .delete("/api/v2/users/admins/rejected")
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(204);

      const deletedAdmins = await prisma.user.findMany({
        where: { id: { in: [rejectedAdminId1, rejectedAdminId2] } },
      });
      expect(deletedAdmins.length).toBe(0);

      const deletedApartments = await prisma.apartment.findMany({
        where: { id: { in: [rejectedApartmentId1, rejectedApartmentId2] } },
      });
      expect(deletedApartments.length).toBe(0);

      const deletedHouseholds = await prisma.household.findMany({
        where: {
          apartmentId: { in: [rejectedApartmentId1, rejectedApartmentId2] },
        },
      });
      expect(deletedHouseholds.length).toBe(0);

      const safeAdmin = await prisma.user.findUnique({
        where: { id: approvedAdminId },
      });
      expect(safeAdmin).not.toBeNull();
    });

    test("실패: 슈퍼 관리자가 아닌 계정이 요청 시 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .delete("/api/v2/users/admins/rejected")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });

  /**
   * 입주민 일괄 삭제 테스트 (관리자 권한 필요)
   */
  describe("DELETE /api/v2/users/residents/rejected", () => {
    let superAdminCookies: string[];
    let adminCookies: string[];
    let userCookies: string[];
    let myApartmentId: string;
    let myRejectedUserId: string;
    let myApprovedUserId: string;
    let otherRejectedUserId: string;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123!", 10);

      const superLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: superAdminData.username,
        password: superAdminData.password,
      });
      superAdminCookies = superLoginRes.headers[
        "set-cookie"
      ] as unknown as string[];

      const adminLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: adminData.username,
        password: newPassword,
      });
      adminCookies = adminLoginRes.headers["set-cookie"] as unknown as string[];

      const userLoginRes = await request(app).post("/api/v2/auth/login").send({
        username: residentUserData.username,
        password: newPassword,
      });
      userCookies = userLoginRes.headers["set-cookie"] as unknown as string[];

      const myAdmin = await prisma.user.findUnique({
        where: { username: adminData.username },
        include: { adminOf: true },
      });
      myApartmentId = myAdmin!.adminOf!.id;

      const otherAdmin = await prisma.user.create({
        data: {
          username: "dirty_admin_for_test",
          password: hashedPassword,
          email: "dirty@naver.com",
          contact: "01066664040",
          name: "Other Admin",
          role: "ADMIN",
          joinStatus: "APPROVED",
          isActive: true,
          adminOf: {
            create: {
              name: "Dirty TEST Apt",
              address: "Dirty TEST City",
              officeNumber: "026664040",
              description: "Should Not Be Cleaned",
              buildingNumberFrom: 1,
              buildingNumberTo: 1,
              floorCountPerBuilding: 1,
              unitCountPerFloor: 1,
            },
          },
        },
        include: { adminOf: true },
      });
      const otherApartmentId = otherAdmin.adminOf!.id;

      const otherHousehold = await prisma.household.create({
        data: { apartmentId: otherApartmentId, building: 1, unit: 101 },
      });

      const myRejected = await prisma.user.create({
        data: {
          username: "my_rejected_res_for_test",
          password: hashedPassword,
          email: "my_rej@naver.com",
          contact: "01011117070",
          name: "My Rejected",
          role: "USER",
          joinStatus: "REJECTED",
          isActive: false,
          resident: {
            create: {
              household: {
                connect: {
                  apartmentId_building_unit: {
                    apartmentId: myApartmentId,
                    building: 1,
                    unit: 101,
                  },
                },
              },
              name: "My Rejected",
              contact: "01011117070",
              email: "my_rej@naver.com",
            },
          },
        },
      });
      myRejectedUserId = myRejected.id;

      const myApproved = await prisma.user.create({
        data: {
          username: "my_approved_res_for_test",
          password: hashedPassword,
          email: "my_app@naver.com",
          contact: "01022229797",
          name: "My Approved",
          role: "USER",
          joinStatus: "APPROVED",
          isActive: true,
          resident: {
            create: {
              household: {
                connect: {
                  apartmentId_building_unit: {
                    apartmentId: myApartmentId,
                    building: 1,
                    unit: 101,
                  },
                },
              },
              name: "My Approved",
              contact: "01022229797",
              email: "my_app@naver.com",
            },
          },
        },
      });
      myApprovedUserId = myApproved.id;

      const otherRejected = await prisma.user.create({
        data: {
          username: "other_rejected_res_for_test",
          password: hashedPassword,
          email: "other_rej@naver.com",
          contact: "01079795454",
          name: "Other Rejected",
          role: "USER",
          joinStatus: "REJECTED",
          isActive: false,
          resident: {
            create: {
              household: { connect: { id: otherHousehold.id } },
              name: "Other Rejected",
              contact: "01079795454",
              email: "other_rej@naver.com",
            },
          },
        },
      });
      otherRejectedUserId = otherRejected.id;
    });

    test("성공: 관리자가 일괄 삭제를 요청하면, '자신의 아파트'에 속한 '거절된(REJECTED)' 입주민만 모두 삭제되어야 한다.", async () => {
      const res = await request(app)
        .delete("/api/v2/users/residents/rejected")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(204);

      const deletedUser = await prisma.user.findUnique({
        where: { id: myRejectedUserId },
      });

      expect(deletedUser).toBeNull();

      const approvedUser = await prisma.user.findUnique({
        where: { id: myApprovedUserId },
      });

      expect(approvedUser).not.toBeNull();

      const otherUser = await prisma.user.findUnique({
        where: { id: otherRejectedUserId },
      });

      expect(otherUser).not.toBeNull();
    });

    test("실패: 슈퍼 관리자가 요청 시 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .delete("/api/v2/users/residents/rejected")
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });

    test("실패: 일반 입주민이 요청 시 상태 코드 401 FORBIDDEN 에러를 반환해야 한다.", async () => {
      const res = await request(app)
        .delete("/api/v2/users/residents/rejected")
        .set("Cookie", userCookies);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch("권한과 관련된 오류입니다.");
    });
  });
});
