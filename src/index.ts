import Crawler from 'crawler'
import Request from 'request';

const cookie = Request.cookie('over18=1')
const j = Request.jar()
const domain = 'https://www.ptt.cc'
const excludeCategory = ['公告', 'sex', '協尋']

const fetchPost = (post:Post) => {
  crawler.queue({
    uri: post.postUrl,
    callback: (err:any, res:any, done:any) => {
      if(err) {
        console.log(err);
      }
      else {
        let $ = res.$
        let links = $('div#main-content > a')
        let linksNum = links.length

        for(var i = 0; i < linksNum; i++) {
          let url = $(links[i]).attr('href')

          if(url.includes('i.imgur.com'))
            console.log(post.title, url, post.postUrl);
        }
      }
      done();
    }
  })
}

j.setCookie('over18=1', domain)

const crawler = new Crawler({
  maxConnetions: 10,
  jar: j,
  callback: (err:any, res:any, done:any) => {
    let $ = res.$
    let nextPageUrl = $($('.btn-group.btn-group-paging > a.btn.wide')[1]).attr('href')

    if(err) {
      console.log(err);
    }
    else {
      let posts = $('div.r-ent')
      let length = posts.length

      for(var i = 0; i < length; i++) {
        let post = new Post($, posts[i])

        if(excludeCategory.indexOf(post.postCategory) > -1 || !post.title) continue

        if(post.push < 30 || isNaN(post.push)) continue;

        fetchPost(post)
      }
    }

    crawler.queue(domain + nextPageUrl)

    done()
  }
})

class Post {
  push:number
  title:string
  postUrl:string
  postCategory:string

  constructor($:any, post:any) {
    this.title = $($(post).find('div.title > a')).text()

    let c = this.title.match(/\[(.*)\]/)

    if(c) this.postCategory = c[1]

    if($($(post).find('div.nrec > span')).text() === '爆')
      this.push = 99
    else
      this.push = parseInt($($(post).find('div.nrec > span')).text())

    this.postUrl = domain + $(post).find('div.title > a').attr('href')
  }
}

crawler.queue(domain + '/bbs/sex/index.html')
