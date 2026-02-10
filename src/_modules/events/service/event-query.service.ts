import { EventQueryRepository } from "../../../_infra/repos/event/event-query.repo";
import { GetEventListReqDto } from "../dtos/req/event.request";

export interface IEventQueryService {
  getEventList: (dto: GetEventListReqDto) => Promise<any>;
}

export const EventQueryService = (deps: {
  eventQueryRepo: EventQueryRepository;
}): IEventQueryService => {
  const { eventQueryRepo } = deps;

  return {
    getEventList: async (dto: GetEventListReqDto) => {
      const { apartmentId, year, month } = dto.query;

      const events = await eventQueryRepo.findList({
        apartmentId,
        year,
        month,
      });

      return events.map((event) => ({
        id: event.id,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.notice.category,
        title: event.title,
        apartmentId: event.apartmentId,
        resourceId: event.noticeId,
        resourceType: event.resourceType,
      }));
    },
  };
};
