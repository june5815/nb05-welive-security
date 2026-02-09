import { ComplaintEntity, Complaint } from "../domain/complaints.entity";
import { IComplaintCommandRepo } from "../../../_common/ports/repos/complaint/complaint-command-repo.interface";
import { IComplaintQueryRepo } from "../../../_common/ports/repos/complaint/complaint-query-repo.interface";
import { INotificationCommandUsecase } from "../../notification/usecases/notification-command.usecase";

export const ComplaintCommandService = (
  commandRepo: IComplaintCommandRepo,
  queryRepo: IComplaintQueryRepo,
  notificationCommandUsecase?: INotificationCommandUsecase,
) => {
  const create = async (dto: any) => {
    try {
      const complaint = ComplaintEntity.create({
        title: dto.body.title,
        content: dto.body.content,
        isPublic: dto.body.isPublic,
        userId: dto.userId,
        apartmentId: dto.body.apartmentId,
      });
      const createdComplaint = await commandRepo.create(complaint);

      try {
        if (notificationCommandUsecase && dto.body.apartmentId) {
          await notificationCommandUsecase.sendComplaintCreatedNotification({
            apartmentId: dto.body.apartmentId,
            complaintTitle: dto.body.title,
            residentName: dto.userId,
          });
        }
      } catch (error) {}

      return createdComplaint;
    } catch (error) {
      throw error;
    }
  };

  const update = async (dto: any) => {
    try {
      const complaint = await queryRepo.findById(dto.params.complaintId);

      if (!complaint) {
        throw new Error("Complaint not found");
      }

      const updatedComplaint = ComplaintEntity.update(complaint, {
        title: dto.body.title,
        content: dto.body.content,
        isPublic: dto.body.isPublic,
      });

      await commandRepo.update(updatedComplaint);

      return updatedComplaint;
    } catch (error) {
      throw error;
    }
  };

  const remove = async (dto: any) => {
    try {
      const complaint = await queryRepo.findById(dto.params.complaintId);

      if (!complaint) {
        throw new Error("Complaint not found");
      }

      if (complaint.id) {
        await commandRepo.delete(complaint.id);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateStatus = async (dto: any) => {
    try {
      const complaint = await queryRepo.findById(dto.params.complaintId);

      if (!complaint) {
        throw new Error("Complaint not found");
      }

      await commandRepo.updateStatus(complaint.id!, dto.body.status);

      try {
        if (notificationCommandUsecase) {
          await notificationCommandUsecase.sendComplaintStatusChangedNotification(
            {
              complaintId: complaint.id!,
              complaintTitle: complaint.title,
              residentId: complaint.userId,
              newStatus: dto.body.status,
            },
          );
        }
      } catch (notificationError) {}
    } catch (error) {
      throw error;
    }
  };

  return {
    create,
    update,
    remove,
    updateStatus,
  };
};
