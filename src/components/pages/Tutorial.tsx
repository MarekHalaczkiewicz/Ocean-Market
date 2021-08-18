import React, { ReactElement, useState } from 'react'
import styles from './Tutorial.module.css'
import { graphql, useStaticQuery } from 'gatsby'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import slugify from 'slugify'
import Permission from '../organisms/Permission'
import { SectionQueryResult } from './Home'
import Wallet from '../molecules/Wallet'
import TutorialChapter, {
  TutorialChapterProps
} from '../molecules/TutorialChapter'

interface TutorialChapterNode {
  node: {
    frontmatter: {
      title: string
      chapter: number
      videoUrl?: string
    }
    rawMarkdownBody: string
    id: string
  }
}

interface Interactivity {
  chapter: number
  component: ReactElement
}

const query = graphql`
  query {
    content: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/.+\/pages\/tutorial\/.+\\.md/"}}, sort: { fields: frontmatter___chapter}) {
      edges {
        node {
          frontmatter {
            title
            chapter
            videoUrl
          }
          rawMarkdownBody
          id
        }
      }
    }
  }
`

const queryDemonstrators = {
  page: 1,
  offset: 2,
  query: {
    query_string: {
      query:
        'id:did\\:op\\:Dd64fD4Ff847A2FBEC2596E7A58fbB439654acB5 id:did\\:op\\:55D7212b58a04D8D24a2B302D749ADEF83B4a7d3'
    }
  },
  sort: { created: -1 }
}

const interactivity = [
  {
    chapter: 2,
    component: (
      <>
        <Wallet />
      </>
    )
  }
]

export default function PageTutorial(): ReactElement {
  const data = useStaticQuery(query)
  const chapterNodes = data.content.edges as TutorialChapterNode[]
  const chapters: TutorialChapterProps[] = chapterNodes.map((edge, i) => ({
    title: edge.node.frontmatter.title,
    markdown: edge.node.rawMarkdownBody,
    chapter: edge.node.frontmatter?.chapter,
    id: slugify(edge.node.frontmatter.title),
    titlePrefix: `Chapter ${i + 1}:`,
    videoUrl: edge.node.frontmatter?.videoUrl
  }))

  const [scrollPosition, setScrollPosition] = useState(0)

  useScrollPosition(({ prevPos, currPos }) => {
    prevPos.y !== currPos.y && setScrollPosition(currPos.y * -1)
  })

  const findInteractiveComponent = (
    arr: Interactivity[],
    chapterNumber: number
  ) => {
    if (!chapterNumber) return
    return arr.find((e) => e.chapter === chapterNumber)?.component
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.toc}>
          <h3>Table of contents</h3>
          <ul>
            {chapters.map((chapter, i) => (
              <li key={i}>
                <a href={`#${chapter.id}`}>{chapter.title}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.tutorial}>
          {chapters.map((chapter, i) => {
            return (
              <TutorialChapter
                chapter={chapter}
                key={i}
                pageProgress={scrollPosition}
                videoUrl={chapter.videoUrl}
                interactiveComponent={findInteractiveComponent(
                  interactivity,
                  chapter.chapter
                )}
              />
            )
          })}
          <Permission eventType="browse">
            <>
              {/* !TODO: query content from json? */}
              <h3>Congratulations!</h3>
              <h5>Go ahead and try it yourself</h5>
              <p>
                Feel free to start your journey into the new european data
                economy right away. You can use our demonstrator assets listed
                below to experience what this data economy could feel like.
              </p>
              <SectionQueryResult
                className="demo"
                title=""
                query={queryDemonstrators}
              />
            </>
          </Permission>
        </div>
      </div>
    </>
  )
}