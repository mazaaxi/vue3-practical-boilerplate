//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Dialog<PARAMS = void, RESULT = void> {
  open(params: PARAMS): Promise<RESULT>
  close(result: RESULT): void
}

type DialogNames = 'message' | 'example'

//==========================================================================
//
//  Export
//
//==========================================================================

export { Dialog, DialogNames }
