type CommentItemProps = {
  id: number;
  points?: number;
  author: string;
  created_at: string;
  text: string;
  children: CommentItemProps[];
};

const CommentItem = (props: CommentItemProps) => (
  <div className="comment-row">
    <div className="comment-header">
      {props.points && <span className="badge">{props.points}</span>}
      <span className="author">{props.author}</span>
      <span className="date">{props.created_at}</span>
    </div>
    <div
      className="text"
      dangerouslySetInnerHTML={{ __html: props.text }}
    ></div>

    {props.children &&
      props.children.map((item: any) => (
        <CommentItem key={item.id} {...item} />
      ))}
  </div>
);
export default CommentItem;
