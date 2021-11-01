//==========================================================================
//
//  Interfaces
//
//==========================================================================

type DialogNames = 'message' | 'example'

interface Dialog<PARAMS = void, RESULT = void> {
  open(params: PARAMS): Promise<RESULT>
  close(result: RESULT): void
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { Dialog, DialogNames }
