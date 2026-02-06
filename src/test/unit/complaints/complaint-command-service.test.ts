import { ComplaintCommandService } from "../../../_modules/complaints/service/complaint-command.service";
import { ComplaintStatus } from "../../../_modules/complaints/domain/complaints.entity";

describe("ComplaintCommandService", () => {
  let service: any;
  let fakeRepo: any;
  let fakeEntity: any;

  beforeEach(() => {
    fakeEntity = {
      id: "1",
      status: ComplaintStatus.PENDING,
      update: jest.fn(),
      remove: jest.fn(),
    };

    fakeRepo = {
      create: jest.fn().mockResolvedValue(fakeEntity),
      findById: jest.fn().mockResolvedValue(fakeEntity),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const uow = {
      getComplaintRepository: () => fakeRepo,
      doTx: async (fn: any) => fn(),
    };

    service = ComplaintCommandService(uow);
  });

  it("creates a complaint", async () => {
    await service.create({
      body: {
        title: "에어컨 고장",
        content: "안 나옴",
        isPublic: true,
        apartmentId: "A1",
      },
      userId: "u1",
    });

    expect(fakeRepo.create).toHaveBeenCalled();
    expect(fakeRepo.save).toHaveBeenCalled();
  });

  it("updates a complaint", async () => {
    await service.update({
      params: { complaintId: "1" },
      body: { title: "수정" },
      userId: "u1",
    });

    expect(fakeRepo.findById).toHaveBeenCalledWith("1");
    expect(fakeEntity.update).toHaveBeenCalled();
    expect(fakeRepo.save).toHaveBeenCalled();
  });

  it("removes a complaint", async () => {
    await service.remove({
      params: { complaintId: "1" },
      userId: "u1",
    });

    expect(fakeEntity.remove).toHaveBeenCalled();
    expect(fakeRepo.delete).toHaveBeenCalledWith("1");
  });

  it("updates status through update()", async () => {
    await service.update({
      params: { complaintId: "1" },
      body: { status: ComplaintStatus.IN_PROGRESS },
      userId: "u1",
    });

    expect(fakeEntity.update).toHaveBeenCalled();
    expect(fakeRepo.save).toHaveBeenCalled();
  });
});
