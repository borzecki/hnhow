import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./NewsFeed.scss";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  loadDetails,
  loadNews,
  reset,
  toggleVisibility,
  selectActiveNews,
  selectActiveNewsStatus,
  selectNewsStatus,
  selectVisibleNews,
} from "./features/news/newsSlice";
import NewsItem from "./components/NewsItem";
import CommentItem from "./components/CommentItem";
import ActiveNews from "./components/ActiveNews";

const NewsFeed = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const news = useAppSelector(selectVisibleNews);
  const newsStatus = useAppSelector(selectNewsStatus);

  const activeNews = useAppSelector(selectActiveNews);
  const activeNewsStatus = useAppSelector(selectActiveNewsStatus);

  const dispatch = useAppDispatch();
  const handleQueryChange = (event: any) => setQuery(event.target.value);

  const isNewsHidden = (id: number): boolean => {
    return JSON.parse(localStorage.getItem("hiddenNews") || "[]").includes(id);
  };

  const toggleNewsVisibility = (id: number) => {
    dispatch(toggleVisibility(id));
  };

  const resetNews = () => {
    setQuery("");
    navigate("/");
    dispatch(reset());
    dispatch(loadNews({ query: "" }));
  };

  const submit = (event: any) => {
    event.preventDefault();
    dispatch(loadNews({ query }));
  };

  useEffect(() => {
    dispatch(loadNews({ query: "" })); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (itemId) dispatch(loadDetails(itemId)); // eslint-disable-next-line
  }, [itemId]);

  return (
    <div className="main-container">
      <div className="app-header">
        <h2>Hacker News</h2>
        <div className="input-wrapper">
          <form onSubmit={submit}>
            <label htmlFor="search" className="sr-only">
              Search
            </label>

            <input
              id="search"
              type="text"
              placeholder="search..."
              value={query}
              className="query-input"
              onChange={handleQueryChange}
            />
            <button type="submit" onClick={submit}>
              Load news
            </button>
            <button type="button" onClick={resetNews}>
              Reset
            </button>
          </form>
        </div>
      </div>
      <div className="app-wrapper">
        <div className="news-section">
          <section className="items-wrapper news">
            {news.map((item) => (
              <NewsItem
                key={item.objectID}
                title={item.title}
                points={item.points}
                url={item.url}
                comments={item.num_comments}
                id={item.objectID}
                active={itemId === item.objectID}
              />
            ))}
            {newsStatus === "loading" && (
              <Skeleton
                count={20}
                height={70}
                className="skeleton"
                baseColor="#EDEDF4"
              />
            )}
            {news.length > 0 && (
              <button
                className="button-load-more"
                onClick={() => dispatch(loadNews({ query, loadMore: true }))}
              >
                Load more news
              </button>
            )}
            {query && news.length === 0 && <>No results</>}
          </section>
        </div>
        {itemId && (
          <div className="comments-section">
            <section className="items-wrapper comments">
              {activeNewsStatus === "loading" && (
                <Skeleton
                  count={10}
                  height={90}
                  baseColor="#EDEDF4"
                  className="skeleton"
                />
              )}

              {activeNews && (
                <ActiveNews
                  {...activeNews}
                  hidden={isNewsHidden(activeNews.id)}
                  toggle={() => toggleNewsVisibility(activeNews.id)}
                />
              )}

              {activeNews?.children.map((item) => (
                <CommentItem key={item.id} {...item} />
              ))}

              {activeNewsStatus === "idle" &&
                activeNews?.children.length === 0 && <>No comments</>}
              {activeNewsStatus === "failed" && (
                <>There was an error loading data from the server.</>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
