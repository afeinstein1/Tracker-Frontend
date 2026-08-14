import { useEffect, useState } from "react"
import { supabase } from '../lib/supabase'
import { loadUserTrackers, createTracker, deleteTracker } from '../lib/trackerService'
import { useIsPremium } from '../lib/premium'
import { Tracker } from "@/Types/field"
import { useFocusEffect } from "expo-router"
import { useCallback } from "react"
import { useRouter } from "expo-router"
import AdBanner, { AD_BANNER_HEIGHT } from "@/components/AdBanner"
import { Box, Button, Dialog, Heading, Portal, Stack, Text } from "@chakra-ui/react"
import '@/css/global.css'

export default function Index() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isPremium = useIsPremium()


  useFocusEffect(
    useCallback(() => {
      fetchTrackers()
    }, [])
  )

  async function fetchTrackers() {
    try {
      setLoading(true)
      const data = await loadUserTrackers()
      setTrackers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const tracker = await createTracker("New Tracker")
      router.push(`/tracker/${tracker.id}?created=1`)
    } catch (e: any) {
      setError(e.message)
    }
  }

const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

async function handleDelete() {
  if (!pendingDeleteId) return
  try {
    await deleteTracker(pendingDeleteId)
    setTrackers(prev => prev.filter(t => t.id !== pendingDeleteId))
    setPendingDeleteId(null)
  } catch (e: any) {
    setError(e.message)
  }
}

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) return <Text p={6}>Loading...</Text>
  if (error) return <Text p={6} color="red.fg">Error: {error}</Text>

  return (
    <Box width="90%" mx="auto" pb={`${AD_BANNER_HEIGHT}px`} py={8}>
      <Stack direction="row" align="center" justify="space-between" wrap="wrap" gap={3} mb={6}>
        <Heading size="lg">My Trackers</Heading>
        <Stack direction="row" wrap="wrap" gap={2}>
          <Button colorPalette="brand" onClick={handleCreate}>+ New Tracker</Button>
          {isPremium && <Button variant="outline" onClick={() => router.push('/import-csv')}>Import from CSV</Button>}
          <Button variant="outline" onClick={() => router.push('/search')}>Find Trackers</Button>
          <Button variant="outline" onClick={() => router.push('/settings')}>Settings</Button>
          <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
        </Stack>
      </Stack>

      {trackers.length === 0 ? (
        <Text color="fg.muted">You don't have any trackers yet. Create one to get started!</Text>
      ) : (
        <Stack gap={3}>
          {trackers.map(tracker => (
            <Box key={tracker.id} borderWidth="1px" borderColor="border" borderRadius="lg" p={4}>
              <Stack direction="row" align="center" justify="space-between" wrap="wrap" gap={2}>
                <Heading size="md">{tracker.title}</Heading>
                <Stack direction="row" gap={2}>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/tracker/${tracker.id}`)}>Open</Button>
                  <Button size="sm" variant="ghost" colorPalette="red" onClick={() => setPendingDeleteId(tracker.id)}>Delete</Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog.Root open={!!pendingDeleteId} onOpenChange={details => { if (!details.open) setPendingDeleteId(null) }} placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header>
                <Dialog.Title>Delete Tracker</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={2}>
                  <Text>This will delete the entire tracker and all its tabs, sections, and fields.</Text>
                  <Text>Are you sure?</Text>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Stack direction="row" gap={2} justify="flex-end" width="100%">
                  <Button variant="outline" onClick={() => setPendingDeleteId(null)}>Go Back</Button>
                  <Button colorPalette="red" onClick={handleDelete}>Confirm Delete</Button>
                </Stack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <AdBanner />
    </Box>
  )
}
