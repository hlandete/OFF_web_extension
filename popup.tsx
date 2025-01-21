import { useCurrentUrl } from "~utils/useCurrentUrl"

function IndexPopup() {
  const { data } = useCurrentUrl()

  if (data) {
    return (
      <div
        style={{
          padding: 16
        }}>
        <h2>You are in {data}</h2>
      </div>
    )
  }
}

export default IndexPopup
