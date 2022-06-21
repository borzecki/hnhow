import { FaEye, FaEyeSlash } from "react-icons/fa";

type ActiveNewsProps = {
  title: string;
  author: string;
  created_at: string;
  url: string;
  text?: string;
  hidden: boolean;
  toggle: () => void;
};

const ActiveNews = (props: ActiveNewsProps) => (
  <section className="active-news">
    <h2>{props.title}</h2>
    <div className="content">
      <span className="author">{props.author}</span>
      <span className="date">{props.created_at}</span>
    </div>
    <a className="news-url" href={props.url} rel="noreferrer" target="_blank">
      {props.url}
    </a>
    <div className="text">{props.text}</div>
    <div className="icon" onClick={props.toggle}>
      {props.hidden ? <FaEye /> : <FaEyeSlash />}
    </div>
  </section>
);

export default ActiveNews;
