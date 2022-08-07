import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { Component } from "react";
import { sortBy } from "lodash";

/*const list = [
  {
    title: "React",
    url: "https://facebook.github.io/react/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: "Redux",
    url: "https://github.com/reactjs/redux",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];*/

const DEFAULT_QUERY = "redux";
const DEFAULT_HPP = "100";
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = "hitsPerPage=";
//const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}}${page}&${PARAM_HPP}${DEFAULT_HPP}`;

const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, "title"),
  AUTHOR: (list) => sortBy(list, "author"),
  COMMENTS: (list) => sortBy(list, "num_comments").reverse(),
  POINTS: (list) => sortBy(list, "points").reverse(),
};

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      //result: null,
      results: null,
      searchKey: "",
      search: "",
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      //sortKey: "NONE",
      //isSortReverse: false,
    };
  }

  needsToSearchTopStories = (searchTerm) => {
    return !this.state.results[searchTerm];
  };

  onDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    // const updatedHits = this.state.result.hits.filter(
    //   (item) => item.objectID !== id
    // );

    const updatedHits = hits.filter((item) => item.objectID !== id);
    // this.setState({
    //   result: { ...this.state.result, hits: updatedHits },
    // });

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page },
      },
    });
  };

  onSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  setSearchTopStories = (result) => {
    //this.setState({ result });
    const { hits, page } = result;
    //const { searchKey, results } = this.state;

    //const oldHits = page !== 0 ? this.state.result.hits : [];
    // const oldHits =
    //   results && results[searchKey] ? results[searchKey].hits : [];

    // const updatedHits = [...oldHits, ...hits];

    // this.setState({
    //   result: { hits: updatedHits, page },
    // });

    // this.setState({
    //   results: {
    //     ...results,
    //     [searchKey]: { hits: updatedHits, page },
    //     isLoading: false,
    //   },
    // });
    this.setState((prevState) => {
      const { searchKey, results } = prevState;

      const oldHits =
        results && results[searchKey] ? results[searchKey].hits : [];

      const updatedHits = [...oldHits, ...hits];

      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page },
        },
        isLoading: false,
      };
    });

    //this.setState(updateSearchTopStoriesState(hits, page)); }
    // const updateSearchTopStoriesState = (hits, page) => (prevState) => {
    //   const { searchKey, results } = prevState;
    //   const oldHits = results && results[searchKey]
    //     ? results[searchKey].hits
    //     : [];
    //   const updatedHits = [
    //     ...oldHits,
    //     ...hits
    // ];
    //   return {
    //     results: {
    // ...results,
    //       [searchKey]: { hits: updatedHits, page }
    //     },
    //     isLoading: false
    //   };
    // };
  };

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true });

    // fetch(
    //   `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`
    // )
    //   .then((response) => response.json())
    //   .then((result) => this.setSearchTopStories(result))
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}\
${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then((result) => this.setSearchTopStories(result.data))
      .catch((error) => this.setState({ error }));
  };

  onSearchSubmit = (event) => {
    const { searchTerm } = this.state;

    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  };

  isSearched = (searchTerm) => (item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase());

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;

    this.setState({ searchKey: searchTerm });

    this.fetchSearchTopStories(searchTerm);

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then((response) => response.json())
      .then((result) => this.setSearchTopStories(result))
      .catch((error) => error);
    //.then(result => this._isMounted && this.setSearchTopStories(result.data))
    //.catch(error => this._isMounted && this.setState({ error }));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // onSort = (sortKey) => {
  //   const isSortReverse =
  //     this.state.sortKey === sortKey && !this.state.isSortReverse;
  //   this.setState({ sortKey, isSortReverse });
  // };

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
      //sortKey,
      //isSortReverse,
    } = this.state;

    // if (error) {
    //   return <p>Something went wrong.</p>;
    // }

    const page =
      (results && results[searchKey] && results[searchKey].page) || 0;

    const list =
      (results && results[searchKey] && results[searchKey].hits) || [];

    // if (!result) {
    //   return null;
    // }
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {/* {result ? (
          <Table
            list={result.hits}
            // pattern={searchTerm}
            onDismiss={this.onDismiss}
          />

        ) : null} */}
        {error ? (
          <div className="interactions">
            <p>Something went wrong.</p>
          </div>
        ) : (
          <Table
            list={list}
            //sortKey={sortKey}
            //onSort={this.onSort}
            onDismiss={this.onDismiss}
            //isSortReverse={isSortReverse}
          />
        )}
        <div className="interactions">
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
            ></Button>
          )}
        </div>
        {/* <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading> */}
      </div>
    );
  }
}

// class Search extends Component {
//   render() {
//     const { value, onChange, children } = this.props;
//     return (
//       <form>
//         {children}
//         <input type="text" value={value} onChange={onChange} />
//       </form>
//     );
//   }
// }

const Search = ({ value, onChange, onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit}>
      <input type="text" value={value} onChange={onChange} />
      <button type="submit">{children}</button>
    </form>
  );
};

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: "NONE",
      isSortReverse: false,
    };
  }

  onSort = (sortKey) => {
    const isSortReverse =
      this.state.sortKey === sortKey && !this.state.isSortReverse;

    this.setState({ sortKey, isSortReverse });
  };

  render() {
    // const { list /*pattern, */, sortKey, isSortReverse, onSort, onDismiss } = this.props;

    const { list, onDismiss } = this.props;
    const { sortKey, isSortReverse } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: "40%" }}>
            <Sort
              sortKey={"TITLE"}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {" "}
              Title
            </Sort>
          </span>
          <span style={{ width: "30%" }}>
            <Sort
              sortKey={"AUTHOR"}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Author
            </Sort>
          </span>
          <span style={{ width: "10%" }}>
            <Sort
              sortKey={"COMMENTS"}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {" "}
              Comments
            </Sort>
          </span>
          <span style={{ width: "10%" }}>
            <Sort
              sortKey={"POINTS"}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Points
            </Sort>
          </span>
          <span style={{ width: "10%" }}>Archive</span>
        </div>
        {reverseSortedList./*filter(isSearched(pattern)).*/ map(
          (item, index) => (
            <div key={index} className="table-row">
              <span style={{ width: "40%" }}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{ width: "30%" }}>{item.author}</span>
              <span style={{ width: "10%" }}>{item.num_comments}</span>
              <span style={{ width: "10%" }}>{item.points}</span>
              <span style={{ width: "10%" }}>
                <Button
                  className="button-inline"
                  onClick={() => onDismiss(item.objectID)}
                >
                  Dismiss
                </Button>
              </span>
            </div>
          )
        )}
      </div>
    );
  }
}

class Button extends Component {
  render() {
    const { onClick, className = "", children } = this.props;
    return (
      <button onClick={onClick} className={className} type="button">
        {children}
      </button>
    );
  }
}

const Loading = () => <div>Loading ...</div>;

const withLoading =
  (Component) =>
  ({ isLoading, ...rest }) =>
    isLoading ? <Loading /> : <Component {...rest} />;

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  const sortClass = ["button-inline"];
  if (sortKey === activeSortKey) {
    sortClass.push("button-active");
  }

  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass.join(" ")}>
      {children}
    </Button>
  );
};

export default App;
