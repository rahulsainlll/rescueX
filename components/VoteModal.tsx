'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { UserWithRelations } from '@/types'
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types'

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: KindeUser<Record<string, string>> | null
  isAuthenticated: boolean | null
  onVoteComplete: () => void
}

const products = [
  { name: "auralized", url: "https://auralized.com", logo: "/aura.png" },
  { name: "dingboard", url: "https://dingboard.com", logo: "/dingboard-logo.png" },
  { name: "rarepepes", url: "https://rarepepes.net/search", logo: "/rp2.png" }
]

const fetchUsers = async (): Promise<UserWithRelations[]> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 4, randomised: true }),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return await response.json()
}

export function VoteModal({ isOpen, onClose, currentUser, isAuthenticated, onVoteComplete }: VoteModalProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    if (isAuthenticated && currentUser) {
      setIsLoading(true)
      setError(null)
      try {
        const fetchedUsers = await fetchUsers()
        setUsers(fetchedUsers)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to load users. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen, loadUsers])

  const onVote = useCallback(async (votedUserId: number) => {
    if (!currentUser || !isAuthenticated) return
    setIsVoting(true)
    setError(null)
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votedUserId }),
      })
      if (!response.ok) throw new Error('Voting failed')
      onVoteComplete()
      onClose()
    } catch (error) {
      console.error('Error voting:', error)
      setError('Failed to cast vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }, [currentUser, isAuthenticated, onVoteComplete, onClose])

  const handleVote = useCallback(() => {
    if (selectedUser !== null) {
      onVote(selectedUser)
    }
  }, [selectedUser, onVote])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadUsers}>Try Again</Button>
        </div>
      )
    }

    if (users.length < 4) {
      return (
        <div className="text-center">
          <p className="text-lg mb-4">Not enough users to vote. Please try again 60 minutes later.</p>
          <p className="text-md font-semibold mb-2">Meanwhile, check out these awesome products:</p>
          <div className="grid grid-cols-3 gap-4">
            {products.map((product, index) => (
              <a
                key={index}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 relative mb-2">
                  <Image
                    src={product.logo}
                    alt={`${product.name} logo`}
                    width={48}
                    height={48}
                    objectFit="contain"
                  />
                </div>
                <span className="text-xs font-medium text-center">{product.name}</span>
              </a>
            ))}
          </div>
          <p className='text-center mt-3'>check out more on <a href='https://tpottools.com/' className='text-blue-800'>tpottools.com</a></p>
        </div>
      )
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.id}
                className={`relative flex flex-col items-center justify-center p-2 border-[1px] rounded-xl max-w-[160px] mx-auto bg-white overflow-hidden cursor-pointer ${
                  selectedUser === user.id ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => !isVoting && setSelectedUser(user.id)}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-bl from-gray-200 via-gray-100 to-gray-200 opacity-60 animate-gradient-diagonal-slow`}></div>
                <div className="relative z-10">
                  <div className="relative">
                    <Image
                      src={user.pfpUrl || "/fallbackAvatar.png"}
                      className="aspect-square w-full max-w-[150px] h-auto rounded-lg shadow mb-1"
                      alt={`${user.username || 'Anonymous'}'s pfp`}
                      width={150}
                      height={150}
                      objectFit="cover"
                    />
                  </div>
                  <h1 className="mb-1 font-mono text-[12px] font-bold text-center text-gray-800 truncate w-full">
                    {user.username || 'Anonymous'}
                  </h1>
                  <p className="text-xs text-green-600 font-mono text-center">
                    Votes: {user.votesReceived.length}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <Button 
          onClick={handleVote} 
          disabled={selectedUser === null || isVoting}
          className="w-full mt-6 text-sm font-semibold"
        >
          {isVoting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Vote'
          )}
        </Button>
      </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isVoting && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-white" aria-describedby="voting-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-mono ">Vote for the Coolest PFP</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}