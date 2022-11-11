import 'dart:convert';

import 'package:ente_auth/core/event_bus.dart';
import 'package:ente_auth/events/codes_updated_event.dart';
import 'package:ente_auth/models/code.dart';
import 'package:ente_auth/services/authenticator_service.dart';
import 'package:logging/logging.dart';

class CodeStore {
  static final CodeStore instance = CodeStore._privateConstructor();

  CodeStore._privateConstructor();

  late AuthenticatorService _authenticatorService;
  final _logger = Logger("CodeStore");

  Future<void> init() async {
    _authenticatorService = AuthenticatorService.instance;
  }

  Future<List<Code>> getAllCodes() async {
    final Map<int, String> rawCodesMap =
        await _authenticatorService.getAllIDtoStringMap();
    final List<Code> codes = [];
    for (final entry in rawCodesMap.entries) {
      final decodeJson = jsonDecode(entry.value);
      final code = Code.fromRawData(decodeJson);
      code.id = entry.key;
      codes.add(code);
    }
    return codes;
  }

  Future<void> addCode(
    Code code, {
    bool shouldSync = true,
  }) async {
    final codes = await getAllCodes();
    for (final existingCode in codes) {
      if (existingCode == code) {
        _logger.info("Found duplicate code, skipping add");
        return;
      }
    }
    code.id = await _authenticatorService.addEntry(
      jsonEncode(code.rawData),
      shouldSync,
    );
    Bus.instance.fire(CodesUpdatedEvent());
  }

  Future<void> removeCode(Code code) async {
    await _authenticatorService.deleteEntry(code.id!);
    Bus.instance.fire(CodesUpdatedEvent());
  }
}
