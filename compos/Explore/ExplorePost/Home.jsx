import React, { useEffect, useState } from 'react';
import { AiOutlineHeart, AiFillHeart, AiOutlineLoading3Quarters, AiOutlineDelete } from 'react-icons/ai';
import { FaRegSave } from 'react-icons/fa';
import Thoughts from './Thoughts';
import AddThought from './AddThought';
import { useSession } from 'next-auth/react';
import Explorecard from '../Explorecard';
import ExploreUser from '../ExploreUser';

function Home({ post, user }) {
  const { data: session } = useSession();
  const [auth, setAuth] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [likeLoading, setLikeLoading] = React.useState(true);
  const [likeStatus, setLikeStatus] = React.useState('Like');

  useEffect(() => {
    if (session) {
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, [session]);

  useEffect(() => {
    likedByUser();
  }, []);

  function likedByUser() {
    fetch("/api/likes/likedByuser?id=" + post.$id)
      .then((res) => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          return 0;
        }
      })
      .then((data) => {
        setLikeLoading(false);
        setLiked(data);
        setLikeStatus(data ? 'Unlike' : 'Like');
      })
      .catch((error) => {
        console.error('An error occurred while checking if the post is liked:', error);
      });
  }

  function likePost() {
    setLikeLoading(true);
    var url = "/api/likes/" + post.$id;

    if (auth) {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ likedby: session.user.email }), // Pass session email in the request body
      })
        .then((res) => {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            return 0;
          }
        })
        .then((data) => {
          console.log(data);
          setLiked(!liked);
          setLikeStatus(liked ? 'Like' : 'Unlike');
          setLikeLoading(false);
        })
        .catch((error) => {
          console.error('An error occurred while liking the post:', error);
        });
    } else {
      console.log(url);
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            return 0;
          }
        })
        .then((data) => {
          console.log(data.length);
        })
        .catch((error) => {
          console.error('An error occurred while liking the post:', error);
        });
    }
  }
  var [posts, setPosts] = useState([])
  function getPost() {
    fetch("/api/post/getpostbyEmail?email=" + post.createdBy)
      .then(res => res.json())
      .then(data => {
        var gotPost = data?.post
        // remove post thats same as params.id
        for (var i = 0; i < gotPost.length; i++) {
          if (gotPost[i].$id === post.$id) {
            gotPost.splice(i, 1)
          }
        }
        var revpost = [...gotPost].reverse()
        setPosts(revpost)
      }
      )
  }
  var [selfposted, setSelfposted] = useState(false)
  function checkifSelfposted() {
    if (post.createdBy === session.user.email) {
      setSelfposted(true)
    } else {
      setSelfposted(false)
    }
  }
  useEffect(() => {
    getPost()
    checkifSelfposted()
  }, [])

  return (
    <div className='explorePost'>
      <div className="ep-top">
        <div className="ep-user flex ">
          <img src={user?.image} alt="" />
          <div className="ep-u-data">
            <p>{post.title}</p>
            <div>{user?.name} . <span>Follow</span></div>
          </div>
        </div>
        <div className="ep-u-actions flex gap-5">
          {!likeLoading ? (
            <div className="btn btn-primary" onClick={likePost}>
              {liked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
              {likeStatus}
            </div>
          ) : (
            <div className="btn btn-primary likeload" >
              <AiOutlineLoading3Quarters size={22} />
            </div>
          )}

          <div className="btn btn-warning">
            <FaRegSave size={22} />
            Save
          </div>

          {(selfposted) && <div className="btn bg-red-800">
            <AiOutlineDelete size={22} />
            Delete
          </div>}

        </div>
      </div>
      <div className="ep-img">
        <img src={post.image} alt="" />
      </div>
      <div className="ep-desc">
        <h2>Description: </h2>
        <p>{post.desc}</p>
      </div>
      {/* <div className="ep-thoughts">
        <AddThought />
        <Thoughts />
      </div> */}
      <div className="ep-userC">
        <ExploreUser user={user} />
      </div>

      {(posts.length > 0) && <div className="ep-more">
        <h2>More by {user.name}</h2>
        <div className="ep-more-posts">

          {posts.slice(0, 4).map((post) => (
            <Explorecard key={post.$id} post={post} />
          ))
          }

        </div>

      </div>}
    </div>
  );
}

export default Home;
