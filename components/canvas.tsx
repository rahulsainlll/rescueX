'use client'

import { useState, useEffect, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { VoteModal } from "./VoteModal"
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs"
import Link from "next/link"
import Loader from "./Loader"
import { LucideListOrdered, LucideLogIn, LucideLogOut, LucideStar } from "lucide-react"
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import BrandLogo from "./brand-logo"
import Nav from "./nav"

function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(callback, delay)
      return () => clearInterval(id)
    }
  }, [callback, delay])
}

const fetchUsers = async (): Promise<string[]> => {
  const response = await fetch('/api/images', { cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const res = await response.json()
  return res;
}

const CELL_SIZE = 70

const Cell = memo(({ columnIndex, rowIndex, style, data }: any) => {
  const index = rowIndex * data.columnCount + columnIndex
  const imageUrl = data.users[index]

  if (!imageUrl) return null

  return (
    <div style={style}>
      <Image
        src={imageUrl}
        alt={`Profile Image ${index}`}
        width={CELL_SIZE}
        height={CELL_SIZE}
        className="object-cover"
        priority={index < 20}
      />
    </div>
  )
})

Cell.displayName = 'Cell'

export default function ProfilePictureCanvas() {
  const [users, setUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, getUser } = useKindeAuth()
  const currentUser = getUser()

  const loadData = useCallback(async () => {
    try {
      const fetchedUsers = await fetchUsers()
      setUsers(prevUsers => {
        if (JSON.stringify(fetchedUsers) !== JSON.stringify(prevUsers)) {
          return fetchedUsers
        }
        return prevUsers
      })
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useInterval(() => {
    loadData()
  }, 10000)

  if (isLoading) return <Loader />
  if (error) return <div className="flex items-center justify-center h-full"><p className="text-red-500" role="alert">{error}</p></div>

  return (
    <main className="fixed inset-0 overflow-hidden bg-gray-100 pt-16 md:pt-0">
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.floor(width / CELL_SIZE)
          const rowCount = Math.ceil(users.length / columnCount)

          return (
            <Grid
              className="List"
              columnCount={columnCount}
              columnWidth={CELL_SIZE}
              height={height}
              rowCount={rowCount}
              rowHeight={CELL_SIZE}
              width={width}
              itemData={{ users, columnCount }}
              key={users.length}
            >
              {Cell}
            </Grid>
          )
        }}
      </AutoSizer>

      <BrandLogo />

      <Nav>
        {!isAuthenticated ? (
          <LoginLink>
            <Button className="rounded-xl">
              <LucideLogIn size={14} className="mr-2" />
              Sign In To Vote
            </Button>
          </LoginLink>
        ) : (
          <>
            <Button onClick={() => setIsVoteModalOpen(true)} className="rounded-xl">
              <LucideStar size={14} className="mr-2" />
              Vote Profiles
            </Button>
            <Link href="/leaderboard">
              <Button className="rounded-xl">
                <LucideListOrdered size={14} className="mr-2" />
                Leaderboard
              </Button>
            </Link>
            <LogoutLink>
              <Button className="rounded-xl">
                <LucideLogOut size={14} className="sm:mr-2" />
                <span className="hidden sm:block">Log out</span>
              </Button>
            </LogoutLink>
          </>
        )}
      </Nav>

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
      />
    </main>
  )
}