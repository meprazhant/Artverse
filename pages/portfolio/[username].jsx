import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Basic from '../../compos/Portfolio/Themes/Basic'
import Head from 'next/head'
import ProgrammerBasic from '../../compos/Portfolio/Themes/Programmer/basic/Basic'
import { useSession } from 'next-auth/react'
import Link from 'next/link'



export async function getServerSideProps(context) {
    const id = context.query.username // Get ID from slug 
    var dataz = null
    var newData = null
    var uname = null
    try {
        dataz = await context.query.username + "@gmail.com"
        uname = await context.query.username
        await fetch(`https://artverses.vercel.app/api/portfolio/${dataz}`)
            .then(res => res.json())
            .then(data => {
                newData = data
            })
            .catch(err => {
                console.log(err)
            })
    } catch (error) {
        console.log(error)
    }
    return {
        props: {
            newData,
            id,
            dataz,
            uname
        }
    }
}

function Username({ newData, id, dataz, uname }) {
    var router = useRouter()
    var session = useSession()
    var [sameUser, setSameUser] = React.useState(false)
    useEffect(() => {
        if (session.data) {
            if (session.data.user.email === dataz) {
                setSameUser(true)
            }
        }
    }, [session.data])

    function sameUSer() {

    }

    useEffect(() => {
        if (router.query.username) {
            fetchUser(router.query.username)
        }
    }, [router.query.username])
    var [loading, setLoading] = React.useState(true)
    var [userFound, setUserFound] = React.useState(false)
    var [theme, setTheme] = React.useState("")
    var [render, setRender] = React.useState(false)


    function fetchUser(a) {
        fetch("/api/users/getbyusername?username=" + a)
            .then(res => res.json())
            .then(data => {
                if (data.user.length === 0) {
                    setUserFound(false)
                } else {
                    setUserFound(true)
                    setUser(data.user[0])
                    fetchPortfolio(data.user[0].email)
                    fetchPost(data.user[0].email)
                    getSocialmedia(data.user[0].social)
                }
            })
    }
    var [datax, setData] = React.useState({
        websiteDetail: {
            title: '',
        },
        landing: {
            bgImg: '',
            heading: '',
            subHeading: '',
        },
        about: {
            heading: '',
            aboutImage: '',
            aboutDesc: '',
        },
        project: '',
        contact: '',
    })
    var [user, setUser] = React.useState()
    var [posts, setPosts] = React.useState([])
    var [socials, setSocials] = React.useState([])



    function getSocialmedia(a) {
        // social = 
        // parse a

        if (a !== "" && a !== "''") {
            var social = JSON.parse(a)
            setSocials(social)
        } else {
            console.log('empty')
        }


    }

    function fetchPost(e) {
        fetch("/api/post/getpostbyEmail?email=" + e)
            .then(res => res.json())
            .then(data => {
                var pros = data?.post
                var revpros = [...pros].reverse()
                setPosts(revpros)
            }
            )
    }
    var [views, setViews] = React.useState(0)

    function fetchPortfolio(email) {
        fetch("/api/portfolio/" + email)
            .then(res => res.json())
            .then(data => {
                setTheme(data.theme)
                setViews(data.views)
                var updatedWebsiteDets = {
                    websiteDetail: {
                        title: data.websiteDetailtitle || '',
                    },
                    landing: {
                        bgImg: data.landingbgImg || '',
                        heading: data.landingheading || '',
                        subHeading: data.landingsubHeading || '',
                    },
                    about: {
                        heading: data.aboutheading || '',
                        aboutImage: data.aboutaboutImage || '',
                        aboutDesc: data.aboutaboutDesc || '',
                    },
                    project: data.projectheading || '',
                    contact: data.contactheading || '',
                };

                setData(updatedWebsiteDets);
            })
        setLoading(false)
        setRender(true)
    }


    return (
        <div>
            <Head>
                <title>{newData.websiteDetailtitle}</title>
                <meta name="description" content={`${newData.websiteDetailtitle} + (Artverse)`} />
                <link rel="icon" href="/favicon.ico" />
                <meta name="title" content={`${newData.websiteDetailtitle} + (Artverse)`} />
                <meta name="description" content={`${newData.landingsubHeading} - created by Artverse's Portfolio`} />

                <meta property="og:type" content="website" />
                <meta property="og:url" content={"http://artverses.vercel.app/portfolio/" + uname} />
                <meta property="og:title" content={`${newData.websiteDetailtitle} (Artverse)`} />
                <meta property="og:description" content={`${newData.landingsubHeading} - created by Artverse's Portfolio`} />
                <meta property="og:image" content={(newData.landingbgImg)} />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={"http://artverses.vercel.app/portfolio/" + uname} />
                <meta property="twitter:title" content="Artverse - The Ultimate Platform for Creatives" />
                <meta property="twitter:description" content={`${newData.landingsubHeading} - Created by Artverse's Portfolio`} />
                <meta property="twitter:image" content={(newData.landingbgImg)}></meta>

            </Head>
            {sameUser && <div className="ph-howdy">
                <div className='ph-howdy-img'>
                    <img src={session.data.user.image} alt="userImage" referrerPolicy='no-referrer' />
                    <h1>Hello {user?.name}, your portfolio got {views} visits. Congrats</h1>
                </div>
                <Link href={"/create/" + theme}>
                    <button className="btn btn-warning">Edit Portfolio</button>
                </Link>

            </div>}
            {
                (loading) ? (
                    <div className="explore-load">
                        <img src="https://i.ibb.co/sWNd2Vc/ARTVERSE-1.gif" alt="loading" />
                    </div>
                ) : (
                    (userFound && render) ? (
                        <div>
                            {(theme == "basic") && <Basic user={user} data={datax} posts={posts} socials={socials} />}
                            {(theme == "programmer") && <ProgrammerBasic user={user} data={datax} posts={posts} socials={socials} />}

                        </div>
                    ) : (
                        <div>
                            <h1>user not found</h1>
                        </div>
                    )
                )
            }
        </div>
    )
}

export default Username

