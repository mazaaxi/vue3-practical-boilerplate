//==========================================================================
//
//  Definition
//
//==========================================================================

interface BaseDialog<PARAMS = void, RESULT = void> {
  open(params: PARAMS): Promise<RESULT>
  close(result: RESULT): void
}

//==========================================================================
//
//  Export
//
//==========================================================================

export type { BaseDialog }