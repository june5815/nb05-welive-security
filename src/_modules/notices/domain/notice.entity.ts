import { NoticeType } from "@prisma/client";

export class NoticeEntity {
  private _title: string;
  private _content: string;
  private _category: string;
  private _type: NoticeType;

  constructor(props: {
    title: string;
    content: string;
    category: string;
    type: NoticeType;
  }) {
    this._title = props.title;
    this._content = props.content;
    this._category = props.category;
    this._type = props.type;
  }

  toPersistence() {
    return {
      title: this._title,
      content: this._content,
      category: this._category,
      type: this._type,
    };
  }
}
