import { Link } from "react-router-dom";

type NewsItemProps = {
  active: boolean;
  id: string;
  title: string;
  url: string;
  points: number;
  comments: number;
};

const NewsItem = (props: NewsItemProps) => (
  <div className={"news-row" + (props.active ? " active" : "")}>
    <div className="content">
      <div className="title">
        <Link to={`/comments/${props.id}`}>{props.title}</Link>
      </div>

      <a className="news-url" href={props.url} rel="noreferrer" target="_blank">
        {props.url}
      </a>
    </div>

    <div className="badges">
      <div className="badge points">{props.points}</div>
      <div className="badge">{props.comments}</div>
    </div>
  </div>
);

export default NewsItem;
